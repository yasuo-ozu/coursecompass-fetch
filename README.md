# CourseCompass-Fetch

This is a helper software for Course Compass, which fetch syllabus data from Waseda university server.

## How to fetch data

```bash

# 1. Search Gakubu you want to fetch
node app searchGakubu 基幹理工

#    Or list all Gakubu(s)
node app listGakubu

# 2. Get Page ID(pid)s to get clas details
node app fetchGakubu 111973 > dest/g_111973.txt

# 3. Preview JSON output
node app fetchClass 2600001002012017260000100226

# 4. dump all data
cat dest/g_111973.txt | node app fetchClass - > dest/o_111973.txt

```

## How to apply data
1. Open Admin console `https://example.com/admin`
1. Click `データの一括登録`
1. Register properties mapping
1. Upload the output file (json)
1. Run

## Important
- Only Admin users of Course Compass can apply some data.
- Applying data will immediately affect to all users in Course Compass.
- Being Admin:
1. Respect the privacy of others.
1. Think before you type.
1. With great power comes great responsibility.
1. Our purpose is neither cheating nor defeating the university---because we love Waseda university. Respect all of the staffs and understand the goal of education.

