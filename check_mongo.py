import os
from pymongo import MongoClient
from dotenv import load_dotenv
import json
from bson import ObjectId

# Custom encoder for ObjectId and datetime
class MongoEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        import datetime
        if isinstance(obj, datetime.datetime):
            return obj.strftime("%Y-%m-%d %H:%M:%S")
        return super().default(obj)

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "shopsmart"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

print(f"Checking MongoDB Database: {DB_NAME}")

collections = ["users", "history", "wishlist"]

for coll_name in collections:
    print(f"\n--- Collection: {coll_name} ---")
    count = db[coll_name].count_documents({})
    print(f"Total documents: {count}")
    
    # Get the latest 3 documents
    cursor = db[coll_name].find().sort("_id", -1).limit(3)
    for doc in cursor:
        print(json.dumps(doc, indent=2, cls=MongoEncoder))
