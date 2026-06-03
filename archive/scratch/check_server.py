import urllib.request

try:
    response = urllib.request.urlopen("http://localhost:8080/")
    print("HTTP Status Code:", response.status)
    print("Served successfully!")
except Exception as e:
    print("Failed to reach server:", e)
