use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Contest {
    pub id: i64,
    pub name: string_or_number,
    pub platform: String,
    pub start_time: String,
    pub duration_seconds: i64,
    pub url: String,
}

// Temporary workaround for clist API sometimes sending ints as names (rare but possible)
type string_or_number = String;

pub fn init_db(db_path: &std::path::Path) -> Result<Connection> {
    let conn = Connection::open(db_path)?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS contests (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            platform TEXT NOT NULL,
            start_time TEXT NOT NULL,
            duration_seconds INTEGER NOT NULL,
            url TEXT NOT NULL
        )",
        [],
    )?;

    Ok(conn)
}

pub fn insert_contests(conn: &Connection, contests: &[Contest]) -> Result<()> {
    let mut stmt = conn.prepare(
        "INSERT OR REPLACE INTO contests (id, name, platform, start_time, duration_seconds, url)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
    )?;

    for contest in contests {
        stmt.execute((
            &contest.id,
            &contest.name,
            &contest.platform,
            &contest.start_time,
            &contest.duration_seconds,
            &contest.url,
        ))?;
    }

    Ok(())
}

pub fn get_upcoming_contests(conn: &Connection) -> Result<Vec<Contest>> {
    let mut stmt = conn.prepare(
        "SELECT id, name, platform, start_time, duration_seconds, url 
         FROM contests 
         WHERE datetime(start_time) >= datetime('now', '-2 hours') 
         ORDER BY datetime(start_time) ASC"
    )?;

    let contest_iter = stmt.query_map([], |row| {
        Ok(Contest {
            id: row.get(0)?,
            name: row.get(1)?,
            platform: row.get(2)?,
            start_time: row.get(3)?,
            duration_seconds: row.get(4)?,
            url: row.get(5)?,
        })
    })?;

    let mut contests = Vec::new();
    for contest in contest_iter {
        contests.push(contest?);
    }

    Ok(contests)
}
