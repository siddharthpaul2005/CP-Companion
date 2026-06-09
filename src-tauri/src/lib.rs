mod database;
mod clist;

use database::{Contest, init_db, insert_contests, get_upcoming_contests};
use tauri::{State, Manager};
use tauri::tray::{TrayIconBuilder, MouseButton, MouseButtonState, TrayIconEvent};
use tauri::WindowEvent;
use std::sync::Mutex;
use rusqlite::Connection;

struct AppState {
    db: Mutex<Connection>,
    // For a real app, load these from config or env
    api_key: String,
    username: String,
}

#[tauri::command]
async fn fetch_contests(state: State<'_, AppState>) -> Result<Vec<Contest>, String> {
    // 1. Fetch from Clist API
    match clist::fetch_contests(&state.api_key, &state.username).await {
        Ok(contests) => {
            // 2. Save to SQLite Cache
            let conn = state.db.lock().unwrap();
            if let Err(e) = insert_contests(&conn, &contests) {
                eprintln!("Failed to cache contests: {}", e);
            }
            
            // 3. Return updated contests
            Ok(contests)
        }
        Err(e) => {
            eprintln!("Failed to fetch from Clist API: {}. Falling back to cache.", e);
            // Fallback to cache
            let conn = state.db.lock().unwrap();
            get_upcoming_contests(&conn).map_err(|e| e.to_string())
        }
    }
}

#[tauri::command]
fn get_cached_contests(state: State<'_, AppState>) -> Result<Vec<Contest>, String> {
    let conn = state.db.lock().unwrap();
    get_upcoming_contests(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn open_main_app(app: tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir().expect("Failed to get app data dir");
            std::fs::create_dir_all(&app_data_dir).expect("Failed to create app data dir");
            let db_path = app_data_dir.join("cp_companion.db");
            
            let conn = init_db(&db_path).expect("Failed to initialize database");
            
            app.manage(AppState {
                db: Mutex::new(conn),
                api_key: "a2743998f53694146f4314c79190b7b441118caa".to_string(),
                username: "Eigenform".to_string(),
            });

            let _tray = TrayIconBuilder::new()
                .tooltip("CP Companion")
                .icon(app.default_window_icon().unwrap().clone())
                .on_tray_icon_event(|tray, event| match event {
                    TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } => {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .build(app)?;
            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                // Prevent app from exiting and just hide the window
                window.hide().unwrap();
                api.prevent_close();
            }
        })
        .invoke_handler(tauri::generate_handler![fetch_contests, get_cached_contests, open_main_app])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
