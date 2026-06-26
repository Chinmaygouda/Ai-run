import os
import json
import logging
import sqlite3
from typing import Dict, Optional

logger = logging.getLogger("ai-run.job-store")

class JobStore:
    def __init__(self):
        self.redis_client = None
        self.use_redis = False
        self.sqlite_db_path = os.path.join(
            os.path.abspath(os.path.join(os.path.dirname(__file__), '..')),
            "data",
            "jobs.db"
        )
        
        # Try connecting to Redis
        redis_host = os.getenv("REDIS_HOST", "localhost")
        redis_port = int(os.getenv("REDIS_PORT", 6379))
        
        try:
            import redis
            logger.info(f"Attempting to connect to Redis at {redis_host}:{redis_port}...")
            self.redis_client = redis.Redis(
                host=redis_host,
                port=redis_port,
                db=0,
                socket_connect_timeout=2.0,
                decode_responses=True
            )
            # Ping to verify connection
            if self.redis_client.ping():
                self.use_redis = True
                logger.info("Successfully connected to Redis. Using Redis as job store.")
            else:
                logger.warning("Redis ping failed. Falling back to SQLite.")
        except Exception as e:
            logger.warning(f"Failed to connect to Redis ({e}). Falling back to SQLite.")
            self.use_redis = False
            self.redis_client = None
            
        if not self.use_redis:
            # Ensure data directory exists
            os.makedirs(os.path.dirname(self.sqlite_db_path), exist_ok=True)
            self._init_sqlite()
            logger.info(f"Using SQLite at {self.sqlite_db_path} as job store.")

    def _init_sqlite(self):
        try:
            with sqlite3.connect(self.sqlite_db_path) as conn:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS jobs (
                        job_id TEXT PRIMARY KEY,
                        status TEXT NOT NULL,
                        message TEXT
                    )
                """)
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to initialize SQLite job store: {e}")

    def get(self, job_id: str) -> Optional[Dict[str, str]]:
        if self.use_redis and self.redis_client:
            try:
                data = self.redis_client.get(f"job:{job_id}")
                if data:
                    return json.loads(data)
                return None
            except Exception as e:
                logger.error(f"Redis get failed: {e}. Falling back to SQLite.")
                return self._get_sqlite(job_id)
        else:
            return self._get_sqlite(job_id)

    def _get_sqlite(self, job_id: str) -> Optional[Dict[str, str]]:
        try:
            with sqlite3.connect(self.sqlite_db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.execute("SELECT status, message FROM jobs WHERE job_id = ?", (job_id,))
                row = cursor.fetchone()
                if row:
                    return {"status": row["status"], "message": row["message"] or ""}
                return None
        except Exception as e:
            logger.error(f"SQLite get failed for job {job_id}: {e}")
            return None

    def set(self, job_id: str, status: str, message: str = ""):
        if self.use_redis and self.redis_client:
            try:
                job_data = {"status": status, "message": message}
                # Store in Redis with a 24-hour expiration (86400 seconds)
                self.redis_client.setex(
                    f"job:{job_id}",
                    86400,
                    json.dumps(job_data)
                )
            except Exception as e:
                logger.error(f"Redis set failed: {e}. Falling back to SQLite.")
                self._set_sqlite(job_id, status, message)
        else:
            self._set_sqlite(job_id, status, message)

    def _set_sqlite(self, job_id: str, status: str, message: str):
        try:
            with sqlite3.connect(self.sqlite_db_path) as conn:
                conn.execute(
                    "INSERT INTO jobs (job_id, status, message) VALUES (?, ?, ?) "
                    "ON CONFLICT(job_id) DO UPDATE SET status=excluded.status, message=excluded.message",
                    (job_id, status, message)
                )
                conn.commit()
        except Exception as e:
            logger.error(f"SQLite set failed for job {job_id}: {e}")
