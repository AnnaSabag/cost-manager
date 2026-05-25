import requests
import sys

filename = input("filename=")

# Logs service
a = "https://cost-manager-logs-5j8w.onrender.com"

# Users service
b = "https://cost-manager-users-20ur.onrender.com"

# Costs service
c = "https://cost-manager-costs-kvsi.onrender.com"

# About service
d = "https://cost-manager-about-6b5d.onrender.com"

output = open(filename, "w", encoding="utf-8")
sys.stdout = output

print("a=" + a)
print("b=" + b)
print("c=" + c)
print("d=" + d)

print()


print("testing getting the about")
print("-------------------------")

try:
    url = d + "/api/about/"

    data = requests.get(url)

    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)
    print("data.text=" + data.text)
    print(data.json())

except Exception as e:
    print("problem")
    print(e)

print("")


print()
print("testing getting the report - 1")
print("------------------------------")

try:
    url = c + "/api/report/?id=123123&year=2026&month=1"

    data = requests.get(url)

    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)
    print("data.text=" + data.text)

except Exception as e:
    print("problem")
    print(e)

print("")


print()
print("testing adding cost item")
print("----------------------------------")

try:
    url = c + "/api/add/"

    data = requests.post(
        url,
        json={
            "userid": 123123,
            "description": "milk 9",
            "category": "food",
            "sum": 8
        }
    )

    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)
    print("data.text=" + data.text)

except Exception as e:
    print("problem")
    print(e)

print("")


print()
print("testing getting the report - 2")
print("------------------------------")

try:
    url = c + "/api/report/?id=123123&year=2026&month=1"

    data = requests.get(url)

    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)
    print("data.text=" + data.text)

except Exception as e:
    print("problem")
    print(e)

print("")


print()
print("testing getting users")
print("--------------------")

try:
    url = b + "/api/users/"

    data = requests.get(url)

    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)
    print("data.text=" + data.text)

except Exception as e:
    print("problem")
    print(e)

print("")


print()
print("testing getting user details")
print("----------------------------")

try:
    url = b + "/api/users/123123"

    data = requests.get(url)

    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)
    print("data.text=" + data.text)

except Exception as e:
    print("problem")
    print(e)

print("")


print()
print("testing getting logs")
print("--------------------")

try:
    url = a + "/api/logs/"

    data = requests.get(url)

    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)
    print("data.text=" + data.text)

except Exception as e:
    print("problem")
    print(e)

print("")
output.close()
