import urllib.request, urllib.error, json, time
from datetime import datetime, timezone

key = '43689b70b9b1504fc513bf5be35eef5a'
base = 'https://api.fortyguard.com'
now = datetime.now(timezone.utc)
headers = {'api-key': key, 'Content-Type': 'application/json'}

body = json.dumps({
    'latitude': 25.2048,
    'longitude': 55.2708,
    'temperature': 28.5,
    'date_time': {'start_date': now.strftime('%Y-%m-%d'), 'filter_type': 3}
}).encode()

req = urllib.request.Request(f'{base}/v1/env_params', data=body, headers=headers, method='POST')
with urllib.request.urlopen(req, timeout=15) as r:
    data = json.loads(r.read())
    activity_id = data['data']['activity_id']
    print(f'activity_id: {activity_id}')

time.sleep(6)
poll_req = urllib.request.Request(f'{base}/v1/status/{activity_id}', headers={'api-key': key})
with urllib.request.urlopen(poll_req, timeout=10) as r:
    result = json.loads(r.read())

# Print the structure keys only - first 3000 chars of beginning
full = json.dumps(result, indent=2)
print("=== FIRST 3000 CHARS ===")
print(full[:3000])
print("=== KEYS OF data.result ===")
inner = result.get('data', {}).get('result', {})
if isinstance(inner, list):
    print(f"result is a LIST of {len(inner)} items")
    if inner:
        print("First item keys:", list(inner[0].keys()) if isinstance(inner[0], dict) else type(inner[0]))
elif isinstance(inner, dict):
    print("result keys:", list(inner.keys()))
    for k, v in inner.items():
        if isinstance(v, list):
            print(f"  {k}: list of {len(v)} items, first={v[0] if v else 'empty'}")
        elif isinstance(v, dict):
            print(f"  {k}: dict with keys {list(v.keys())}")
        else:
            print(f"  {k}: {v}")
