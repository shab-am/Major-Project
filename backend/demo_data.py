"""
Synthetic live sensor stream for local development when MariaDB is unavailable.
"""

import math
import os
import random
from datetime import datetime, timedelta


def demo_enabled_from_env():
    return os.getenv('USE_DEMO_DATA', '').lower() in ('1', 'true', 'yes')


def is_demo_requested(request_args=None):
    if demo_enabled_from_env():
        return True
    if not request_args:
        return False
    val = request_args.get('demo', request_args.get('use_demo', ''))
    return str(val).lower() in ('1', 'true', 'yes')


def is_stress_demo_requested(request_args=None):
    """Query/API flag: intentionally bad readings to flood plant issue alerts in the UI."""
    if not request_args:
        return False
    val = request_args.get('stress_demo', request_args.get('bad_data', ''))
    return str(val).lower() in ('1', 'true', 'yes')


def generate_demo_project_readings(count=72, *, refresh_tick=None):
    """Time-series rows matching project_readings schema."""
    tick = refresh_tick if refresh_tick is not None else int(datetime.utcnow().timestamp() // 30)
    random.seed(tick)
    rows = []
    now = datetime.utcfromtimestamp(tick * 30)
    base_ph = 6.05
    base_temp = 21.0
    base_humidity = 62.0
    base_tds = 720.0
    base_do = 6.8
    base_ec = 1.35
    base_electro = 1.05

    for i in range(count):
        t = now - timedelta(seconds=(count - i) * 5)
        wave = math.sin(i / 6.0)
        drift = (i - count // 2) * 0.008
        ph = round(base_ph + wave * 0.18 + drift + random.uniform(-0.05, 0.05), 3)
        temp = round(base_temp + wave * 0.25 + drift * 0.2 + random.uniform(-0.05, 0.05), 2)
        humidity = round(base_humidity + wave * 4 + random.uniform(-2, 2), 1)
        tds = round(base_tds + wave * 40 + i * 0.6 + random.uniform(-15, 15), 1)
        dissolved_oxygen = round(base_do + wave * 0.35 + random.uniform(-0.15, 0.15), 2)
        ec = round(base_ec + wave * 0.08 + random.uniform(-0.03, 0.03), 3)
        electro = round(base_electro + wave * 0.12 + random.uniform(-0.05, 0.05), 3)

        if i % 12 in (0, 1):
            humidity = round(78.0 + random.uniform(-1.0, 1.4), 1)
        if i % 15 == 4:
            dissolved_oxygen = round(4.35 + random.uniform(-0.18, 0.12), 2)
        if i % 18 == 7:
            ph = round(6.75 + random.uniform(-0.05, 0.08), 3)

        if i >= count - 1:
            ph = round(6.92 + random.uniform(-0.03, 0.04), 3)
            humidity = round(79.5 + random.uniform(-0.6, 0.8), 1)
            dissolved_oxygen = round(4.2 + random.uniform(-0.08, 0.08), 2)
            tds = round(930.0 + random.uniform(-12, 15), 1)

        row_id = (tick % 5000) * 100 + (count - i)
        rows.append({
            'id': row_id,
            'recorded_at': t.isoformat(),
            'ph_value': ph,
            'ambient_temperature': temp,
            'humidity': humidity,
            'tds_value': tds,
            'dissolved_oxygen': dissolved_oxygen,
            'soil_temperature': round(temp - 0.55 + random.uniform(-0.03, 0.03), 2),
            'light_intensity': round(480 + wave * 80 + random.uniform(-30, 30)),
            'ec_value': ec,
            'electrochemical_signal': electro,
        })

    rows.sort(key=lambda r: r['recorded_at'], reverse=True)
    return rows


def generate_stress_demo_project_readings(count=72, *, refresh_tick=None):
    """
    Same schema as generate_demo_project_readings, but metrics sit outside every
    SPECIES_PROFILE band in app.py so each plant gets multiple issue strings.
    """
    tick = refresh_tick if refresh_tick is not None else int(datetime.utcnow().timestamp() // 30)
    random.seed(tick + 7919)
    rows = []
    now = datetime.utcfromtimestamp(tick * 30)

    for i in range(count):
        t = now - timedelta(seconds=(count - i) * 5)
        wave = math.sin(i / 5.0)

        ph = round(4.05 + wave * 0.12 + random.uniform(-0.06, 0.06), 3)
        temp = round(29.8 + wave * 0.25 + random.uniform(-0.06, 0.06), 2)
        humidity = round(38.0 + wave * 3.0 + random.uniform(-1.5, 1.5), 1)
        tds = round(1120.0 + wave * 45 + random.uniform(-25, 25), 1)
        dissolved_oxygen = round(3.35 + wave * 0.25 + random.uniform(-0.12, 0.12), 2)
        ec = round(2.35 + wave * 0.06 + random.uniform(-0.04, 0.04), 3)
        electro = round(1.45 + wave * 0.18 + random.uniform(-0.06, 0.06), 3)

        row_id = (tick % 5000) * 100 + (count - i)
        rows.append({
            'id': row_id,
            'recorded_at': t.isoformat(),
            'ph_value': ph,
            'ambient_temperature': temp,
            'humidity': humidity,
            'tds_value': tds,
            'dissolved_oxygen': dissolved_oxygen,
            'soil_temperature': round(temp + 0.75 + random.uniform(-0.04, 0.04), 2),
            'light_intensity': round(120 + wave * 35 + random.uniform(-15, 15)),
            'ec_value': ec,
            'electrochemical_signal': electro,
        })

    rows.sort(key=lambda r: r['recorded_at'], reverse=True)
    return rows
