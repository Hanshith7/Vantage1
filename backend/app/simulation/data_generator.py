"""Simulated data generator for Vantage demo scenarios."""

from __future__ import annotations

import random
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any


def _uid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class DataGenerator:
    """Generates realistic institutional activity data for all connected systems."""

    # ── Attendance patterns ───────────────────────────────────────────

    DAY_ATTENDANCE = {
        0: (90, 94),   # Monday
        1: (92, 96),   # Tuesday
        2: (91, 95),   # Wednesday
        3: (90, 94),   # Thursday
        4: (85, 91),   # Friday
        5: (40, 60),   # Saturday (low)
        6: (0, 5),     # Sunday
    }

    DEPT_OFFSETS = {
        "CSE": 1.5,
        "ECE": 0.5,
        "EEE": -0.5,
        "MECH": -1.5,
        "CIVIL": -1.0,
    }

    SECTIONS = {
        "CSE": ["CSE-3A", "CSE-3B", "CSE-3C", "CSE-3D"],
        "ECE": ["ECE-3A", "ECE-3B"],
        "EEE": ["EEE-3A", "EEE-3B"],
        "MECH": ["MECH-3A", "MECH-3B"],
        "CIVIL": ["CIVIL-3A", "CIVIL-3B"],
    }

    SESSION_OFFSETS = {
        "morning_1": -1.0,    # 8:30 AM slightly lower
        "morning_2": 0.5,     # 10:00 AM
        "afternoon_1": 1.0,   # 11:30 AM peak
        "afternoon_2": -0.5,  # 2:00 PM
        "afternoon_3": -1.5,  # 3:30 PM
    }

    # ── Generate normal scenario ──────────────────────────────────────

    def generate_normal_scenario(
        self, system_ids: dict[str, str], days: int = 30
    ) -> tuple[list[dict], list[dict], list[dict]]:
        """Generate 30 days of normal activity for all systems.

        Returns (events, baselines, data_quality).
        """
        events: list[dict] = []
        now = _now()

        # ── Attendance events ─────────────────────────────────────
        att_id = system_ids.get("attendance", "")
        for day_offset in range(days, 0, -1):
            day = now - timedelta(days=day_offset)
            dow = day.weekday()

            if dow >= 6:  # Skip Sunday
                continue

            base_min, base_max = self.DAY_ATTENDANCE.get(dow, (88, 93))

            for dept, sections in self.SECTIONS.items():
                dept_offset = self.DEPT_OFFSETS.get(dept, 0)

                for section in sections:
                    for session_name, session_offset in self.SESSION_OFFSETS.items():
                        # Calculate attendance with natural variance
                        base = random.uniform(base_min, base_max)
                        value = base + dept_offset + session_offset + random.gauss(0, 1.2)
                        value = max(0, min(100, round(value, 1)))

                        hour = {"morning_1": 8, "morning_2": 10, "afternoon_1": 11,
                                "afternoon_2": 14, "afternoon_3": 15}[session_name]
                        ts = day.replace(hour=hour, minute=30, second=0, microsecond=0)

                        events.append({
                            "id": _uid(),
                            "system_id": att_id,
                            "timestamp": ts,
                            "event_type": "attendance_recorded",
                            "entity_type": "section",
                            "entity_id": section,
                            "value": value,
                            "status": "normal",
                            "description": f"Attendance recorded for {section}",
                            "normalized_data": {
                                "department": dept,
                                "section": section,
                                "session": session_name,
                                "day_of_week": dow,
                            },
                            "created_at": ts,
                        })

        # ── Student portal events ─────────────────────────────────
        sp_id = system_ids.get("student_portal", "")
        for day_offset in range(days, 0, -1):
            day = now - timedelta(days=day_offset)
            if day.weekday() >= 6:
                continue

            # Generate login bursts at peak hours
            for hour in [9, 10, 11, 14, 15, 16]:
                count = random.randint(30, 80)
                ts = day.replace(hour=hour, minute=random.randint(0, 59))

                events.append({
                    "id": _uid(),
                    "system_id": sp_id,
                    "timestamp": ts,
                    "event_type": "portal_activity",
                    "entity_type": "portal",
                    "entity_id": "student_portal",
                    "value": float(count),
                    "status": "normal",
                    "description": f"{count} student portal sessions active",
                    "normalized_data": {"activity_type": "login_burst", "hour": hour},
                    "created_at": ts,
                })

        # ── Faculty events ────────────────────────────────────────
        fac_id = system_ids.get("faculty", "")
        for day_offset in range(days, 0, -1):
            day = now - timedelta(days=day_offset)
            if day.weekday() >= 6:
                continue

            for hour in [8, 9, 10, 11, 14, 15]:
                count = random.randint(5, 25)
                ts = day.replace(hour=hour, minute=random.randint(0, 30))

                events.append({
                    "id": _uid(),
                    "system_id": fac_id,
                    "timestamp": ts,
                    "event_type": "faculty_activity",
                    "entity_type": "faculty",
                    "entity_id": "faculty_services",
                    "value": float(count),
                    "status": "normal",
                    "description": f"{count} faculty service interactions",
                    "normalized_data": {"activity_type": "service_usage", "hour": hour},
                    "created_at": ts,
                })

        # ── Database health events ────────────────────────────────
        db_id = system_ids.get("database_health", "")
        for day_offset in range(days, 0, -1):
            day = now - timedelta(days=day_offset)

            for hour in range(0, 24, 1):
                response_time = random.gauss(28, 6)
                response_time = max(8, round(response_time, 1))

                ts = day.replace(hour=hour, minute=0)

                events.append({
                    "id": _uid(),
                    "system_id": db_id,
                    "timestamp": ts,
                    "event_type": "health_check",
                    "entity_type": "database",
                    "entity_id": "primary_db",
                    "value": response_time,
                    "status": "normal",
                    "description": f"Database response time: {response_time}ms",
                    "normalized_data": {
                        "metric": "response_time_ms",
                        "availability": 99.9 + random.uniform(0, 0.1),
                        "error_rate": round(random.uniform(0, 0.3), 2),
                        "connections": random.randint(20, 80),
                    },
                    "created_at": ts,
                })

        # ── Baselines ────────────────────────────────────────────
        baselines = self._compute_baselines(events, system_ids)

        # ── Data quality ─────────────────────────────────────────
        quality = []
        for sys_type, sys_id in system_ids.items():
            sys_events = [e for e in events if e["system_id"] == sys_id]
            quality.append({
                "id": _uid(),
                "system_id": sys_id,
                "completeness": round(random.uniform(97.5, 100.0), 1),
                "duplicates": random.randint(0, 5),
                "delayed": random.randint(0, 3),
                "invalid": 0,
                "total_records": len(sys_events),
                "checked_at": _now(),
            })

        return events, baselines, quality

    def _compute_baselines(
        self, events: list[dict], system_ids: dict[str, str]
    ) -> list[dict]:
        """Compute baselines from generated event history."""
        baselines = []

        # Attendance baseline by day of week
        att_id = system_ids.get("attendance", "")
        att_events = [e for e in events if e["system_id"] == att_id and e["value"] is not None]

        # Overall attendance baseline
        att_values = [e["value"] for e in att_events]
        if att_values:
            import numpy as np
            mean = float(np.mean(att_values))
            std = float(np.std(att_values))
            baselines.append({
                "id": _uid(),
                "system_id": att_id,
                "metric_name": "attendance_rate",
                "context": {"scope": "institution"},
                "expected_min": round(mean - 1.5 * std, 1),
                "expected_max": round(mean + 1.5 * std, 1),
                "mean": round(mean, 1),
                "std_dev": round(std, 1),
                "sample_count": len(att_values),
                "updated_at": _now(),
            })

            # Per day of week
            for dow in range(6):  # Mon-Sat
                dow_vals = [
                    e["value"] for e in att_events
                    if e.get("normalized_data", {}).get("day_of_week") == dow
                ]
                if dow_vals:
                    m = float(np.mean(dow_vals))
                    s = float(np.std(dow_vals))
                    baselines.append({
                        "id": _uid(),
                        "system_id": att_id,
                        "metric_name": "attendance_rate",
                        "context": {"scope": "day_of_week", "day": dow},
                        "expected_min": round(m - 1.5 * s, 1),
                        "expected_max": round(m + 1.5 * s, 1),
                        "mean": round(m, 1),
                        "std_dev": round(s, 1),
                        "sample_count": len(dow_vals),
                        "updated_at": _now(),
                    })

            # Per department
            for dept in self.SECTIONS:
                dept_vals = [
                    e["value"] for e in att_events
                    if e.get("normalized_data", {}).get("department") == dept
                ]
                if dept_vals:
                    m = float(np.mean(dept_vals))
                    s = float(np.std(dept_vals))
                    baselines.append({
                        "id": _uid(),
                        "system_id": att_id,
                        "metric_name": "attendance_rate",
                        "context": {"scope": "department", "department": dept},
                        "expected_min": round(m - 1.5 * s, 1),
                        "expected_max": round(m + 1.5 * s, 1),
                        "mean": round(m, 1),
                        "std_dev": round(s, 1),
                        "sample_count": len(dept_vals),
                        "updated_at": _now(),
                    })

        # Database health baseline
        db_id = system_ids.get("database_health", "")
        db_events = [e for e in events if e["system_id"] == db_id and e["value"] is not None]
        if db_events:
            import numpy as np
            db_vals = [e["value"] for e in db_events]
            m = float(np.mean(db_vals))
            s = float(np.std(db_vals))
            baselines.append({
                "id": _uid(),
                "system_id": db_id,
                "metric_name": "response_time_ms",
                "context": {"scope": "system"},
                "expected_min": round(max(5, m - 2 * s), 1),
                "expected_max": round(m + 2 * s, 1),
                "mean": round(m, 1),
                "std_dev": round(s, 1),
                "sample_count": len(db_vals),
                "updated_at": _now(),
            })

        # Student portal baseline
        sp_id = system_ids.get("student_portal", "")
        sp_events = [e for e in events if e["system_id"] == sp_id and e["value"] is not None]
        if sp_events:
            import numpy as np
            sp_vals = [e["value"] for e in sp_events]
            m = float(np.mean(sp_vals))
            s = float(np.std(sp_vals))
            baselines.append({
                "id": _uid(),
                "system_id": sp_id,
                "metric_name": "session_count",
                "context": {"scope": "system"},
                "expected_min": round(max(0, m - 1.5 * s), 1),
                "expected_max": round(m + 1.5 * s, 1),
                "mean": round(m, 1),
                "std_dev": round(s, 1),
                "sample_count": len(sp_vals),
                "updated_at": _now(),
            })

        # Faculty baseline
        fac_id = system_ids.get("faculty", "")
        fac_events = [e for e in events if e["system_id"] == fac_id and e["value"] is not None]
        if fac_events:
            import numpy as np
            fac_vals = [e["value"] for e in fac_events]
            m = float(np.mean(fac_vals))
            s = float(np.std(fac_vals))
            baselines.append({
                "id": _uid(),
                "system_id": fac_id,
                "metric_name": "interaction_count",
                "context": {"scope": "system"},
                "expected_min": round(max(0, m - 1.5 * s), 1),
                "expected_max": round(m + 1.5 * s, 1),
                "mean": round(m, 1),
                "std_dev": round(s, 1),
                "sample_count": len(fac_vals),
                "updated_at": _now(),
            })

        return baselines

    # ── Scenario generators ───────────────────────────────────────────

    def generate_attendance_drop(
        self, system_ids: dict[str, str]
    ) -> tuple[list[dict], dict]:
        """Scenario 2: CSE 3-C drops to 62%."""
        att_id = system_ids.get("attendance", "")
        now = _now()

        events = []
        # Normal sections
        for section in ["CSE-3A", "CSE-3B", "CSE-3D"]:
            val = round(random.uniform(89, 94), 1)
            events.append({
                "id": _uid(),
                "system_id": att_id,
                "timestamp": now,
                "event_type": "attendance_recorded",
                "entity_type": "section",
                "entity_id": section,
                "value": val,
                "status": "normal",
                "description": f"Attendance recorded for {section}: {val}%",
                "normalized_data": {
                    "department": "CSE", "section": section,
                    "session": "morning_2", "day_of_week": now.weekday(),
                },
                "created_at": now,
            })

        # Anomalous section
        drop_value = round(random.uniform(58, 65), 1)
        events.append({
            "id": _uid(),
            "system_id": att_id,
            "timestamp": now,
            "event_type": "attendance_recorded",
            "entity_type": "section",
            "entity_id": "CSE-3C",
            "value": drop_value,
            "status": "deviation",
            "description": f"Attendance recorded for CSE-3C: {drop_value}%",
            "normalized_data": {
                "department": "CSE", "section": "CSE-3C",
                "session": "morning_2", "day_of_week": now.weekday(),
            },
            "created_at": now,
        })

        signal = {
            "id": _uid(),
            "system_id": att_id,
            "title": "Unexpected attendance drop",
            "description": f"Attendance in CSE-3C dropped to {drop_value}%, significantly below the expected range of 89–94%.",
            "attention_level": "high",
            "status": "needs_attention",
            "first_detected": now,
            "last_updated": now,
            "deviation_score": 0.78,
            "trajectory": "developing",
            "explanation": {
                "what_changed": f"Attendance dropped to {drop_value}%, below the expected range of 89–94%.",
                "why_noticed": [
                    "Significant deviation from expected range",
                    "Sudden change from previous session",
                    "Other CSE sections remain within normal range",
                ],
                "related_context": [],
                "current_state": "Needs attention",
            },
            "related_events": [],
        }

        return events, signal

    def generate_system_delay(
        self, system_ids: dict[str, str]
    ) -> tuple[list[dict], dict]:
        """Scenario 3: Database response time spikes."""
        db_id = system_ids.get("database_health", "")
        now = _now()

        events = []
        spike_value = round(random.uniform(120, 200), 1)

        events.append({
            "id": _uid(),
            "system_id": db_id,
            "timestamp": now,
            "event_type": "health_check",
            "entity_type": "database",
            "entity_id": "primary_db",
            "value": spike_value,
            "status": "deviation",
            "description": f"Database response time: {spike_value}ms (elevated)",
            "normalized_data": {
                "metric": "response_time_ms",
                "availability": 99.2,
                "error_rate": 2.1,
                "connections": 142,
            },
            "created_at": now,
        })

        signal = {
            "id": _uid(),
            "system_id": db_id,
            "title": "Database response time elevated",
            "description": f"Database response time increased to {spike_value}ms, significantly above the expected range of 15–45ms.",
            "attention_level": "moderate",
            "status": "needs_attention",
            "first_detected": now,
            "last_updated": now,
            "deviation_score": 0.62,
            "trajectory": "developing",
            "explanation": {
                "what_changed": f"Response time increased to {spike_value}ms from an expected range of 15–45ms.",
                "why_noticed": [
                    "Response time significantly above expected range",
                    "Error rate slightly elevated",
                    "Connection count above typical levels",
                ],
                "related_context": [],
                "current_state": "Needs attention",
            },
            "related_events": [],
        }

        return events, signal

    def generate_correlated_event(
        self, system_ids: dict[str, str]
    ) -> tuple[list[dict], list[dict]]:
        """Scenario 4: DB spike followed by attendance drop — correlated."""
        db_id = system_ids.get("database_health", "")
        att_id = system_ids.get("attendance", "")
        now = _now()
        earlier = now - timedelta(minutes=8)

        events = []

        # DB spike first
        spike_value = round(random.uniform(150, 220), 1)
        db_event_id = _uid()
        events.append({
            "id": db_event_id,
            "system_id": db_id,
            "timestamp": earlier,
            "event_type": "health_check",
            "entity_type": "database",
            "entity_id": "primary_db",
            "value": spike_value,
            "status": "deviation",
            "description": f"Database response time: {spike_value}ms (elevated)",
            "normalized_data": {
                "metric": "response_time_ms",
                "availability": 98.5,
                "error_rate": 3.4,
                "connections": 156,
            },
            "created_at": earlier,
        })

        # Then attendance drop
        drop_value = round(random.uniform(58, 65), 1)
        att_event_id = _uid()
        events.append({
            "id": att_event_id,
            "system_id": att_id,
            "timestamp": now,
            "event_type": "attendance_recorded",
            "entity_type": "section",
            "entity_id": "CSE-3C",
            "value": drop_value,
            "status": "deviation",
            "description": f"Attendance recorded for CSE-3C: {drop_value}%",
            "normalized_data": {
                "department": "CSE", "section": "CSE-3C",
                "session": "morning_2", "day_of_week": now.weekday(),
            },
            "created_at": now,
        })

        # Normal sections for contrast
        for section in ["CSE-3A", "CSE-3B", "CSE-3D"]:
            val = round(random.uniform(89, 94), 1)
            events.append({
                "id": _uid(),
                "system_id": att_id,
                "timestamp": now,
                "event_type": "attendance_recorded",
                "entity_type": "section",
                "entity_id": section,
                "value": val,
                "status": "normal",
                "description": f"Attendance recorded for {section}: {val}%",
                "normalized_data": {
                    "department": "CSE", "section": section,
                    "session": "morning_2", "day_of_week": now.weekday(),
                },
                "created_at": now,
            })

        signals = [
            {
                "id": _uid(),
                "system_id": db_id,
                "title": "Database response time elevated",
                "description": f"Database response time increased to {spike_value}ms, significantly above expected range.",
                "attention_level": "moderate",
                "status": "needs_attention",
                "first_detected": earlier,
                "last_updated": now,
                "deviation_score": 0.65,
                "trajectory": "developing",
                "explanation": {
                    "what_changed": f"Response time increased to {spike_value}ms from expected range of 15–45ms.",
                    "why_noticed": [
                        "Response time significantly above expected range",
                        "Error rate elevated",
                    ],
                    "related_context": [
                        f"An attendance deviation was observed 8 minutes after this change.",
                    ],
                    "current_state": "Needs attention",
                },
                "related_events": [{"event_id": att_event_id, "relationship": "following"}],
            },
            {
                "id": _uid(),
                "system_id": att_id,
                "title": "Unexpected attendance drop",
                "description": f"Attendance in CSE-3C dropped to {drop_value}%, significantly below expected range.",
                "attention_level": "high",
                "status": "needs_attention",
                "first_detected": now,
                "last_updated": now,
                "deviation_score": 0.82,
                "trajectory": "developing",
                "explanation": {
                    "what_changed": f"Attendance dropped to {drop_value}%, below expected range of 89–94%.",
                    "why_noticed": [
                        "Significant deviation from expected range",
                        "Sudden change from previous session",
                        "Other CSE sections remain within normal range",
                    ],
                    "related_context": [
                        f"Database response time increased to {spike_value}ms approximately 8 minutes before this change.",
                    ],
                    "current_state": "Needs attention",
                },
                "related_events": [{"event_id": db_event_id, "relationship": "preceding"}],
            },
        ]

        return events, signals
