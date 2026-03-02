# GraphQL Testing Guide

## Quick Start Testing

### 1. **Automated Test Suite** (Recommended)
Run the included test script to verify all endpoints:

```bash
node test-graphql.mjs
```

This will test:
- ✅ GET /graphql endpoint
- ✅ Query getMaterialTypes
- ✅ Query getMaterials with nested relations
- ✅ Query getUsers
- ✅ Error handling for invalid queries
- ✅ Validation for empty requests

---

## Manual Testing Methods

### 2. **cURL (Command Line)**

#### Test GET endpoint:
```bash
curl http://localhost:3000/graphql
```

Expected response:
```json
{
  "message": "GraphQL endpoint",
  "instructions": "Send POST requests with GraphQL JSON query to this endpoint"
}
```

#### Test POST query:
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ getMaterialTypes { id title } }"}'
```

---

### 3. **PowerShell**

```powershell
$query = @{
    query = '{getMaterialTypes{id title}}'
} | ConvertTo-Json

Invoke-WebRequest -Uri 'http://localhost:3000/graphql' `
  -Method POST `
  -ContentType 'application/json' `
  -Body $query `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

---

### 4. **Node.js / JavaScript**

```javascript
import http from 'http';

const query = JSON.stringify({
  query: '{ getMaterialTypes { id title } }'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/graphql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': query.length
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(JSON.parse(data)));
});

req.write(query);
req.end();
```

---

### 5. **Postman / Thunder Client**

1. Create a new POST request
2. URL: `http://localhost:3000/graphql`
3. Set header: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "query": "{ getMaterialTypes { id title } }"
}
```
5. Send

---

## Example GraphQL Queries

### Get Material Types with Materials
```graphql
query {
  getMaterialTypes {
    id
    title
    material {
      id
      title
      quantity
      unit
    }
  }
}
```

### Get Materials
```graphql
query {
  getMaterials {
    id
    title
    unit
    quantity
    minimum_threshold
    material_type {
      title
    }
  }
}
```

### Get Users
```graphql
query {
  getUsers {
    id
    fullname
    position
    email
    role
    status
  }
}
```

### Get MR Forms with Materials
```graphql
query {
  getMrForms {
    id
    ref_no
    subject
    status
    form_date
    creator_id
    mr_form_materials {
      quantity
      material {
        id
        title
        unit
      }
    }
  }
}
```

### Get Material by ID
```graphql
query {
  getMaterialById(id: 1) {
    id
    title
    quantity
    unit
    material_type {
      title
    }
  }
}
```

---

## Example GraphQL Mutations

### Create Material Type
```graphql
mutation {
  createMaterialType(input: {
    title: "Electronics"
  }) {
    id
    title
  }
}
```

### Create Material
```graphql
mutation {
  createMaterial(input: {
    title: "Copper Wire"
    material_type_id: 1
    unit: "meter"
    minimum_threshold: 100
    quantity: 500
  }) {
    id
    title
    quantity
  }
}
```

### Create User
```graphql
mutation {
  createUser(input: {
    fullname: "John Doe"
    position: "Manager"
    username: "johndoe"
    email: "john@example.com"
    role: 1
  }) {
    id
    fullname
    email
  }
}
```

---

## Troubleshooting

### "Cannot GET /graphql"
**Issue:** Trying to access GraphQL with GET request  
**Solution:** GraphQL requires POST requests. Use one of the methods above.

### "Request body is empty"
**Issue:** Sending POST without a body  
**Solution:** Include GraphQL query in JSON body:
```json
{"query":"{ getMaterialTypes { id } }"}
```

### "GraphQL query is required"
**Issue:** Body doesn't contain `query` field  
**Solution:** Ensure your JSON has a `query` property with the GraphQL operation.

### "Cannot connect to localhost:3000"
**Issue:** Server not running  
**Solution:** 
```bash
npm run dev
```
Make sure you see:
```
✓ Prisma connected
✓ Apollo Server ready at http://localhost:3000/graphql
✓ Server ready at http://localhost:3000
```

### "Cannot destructure property..."
**Issue:** Handler receiving malformed request  
**Solution:** Ensure Content-Type header is `application/json`

---

## Verification Checklist

- [ ] Server runs: `npm run dev` shows success messages
- [ ] GET /graphql returns 200 with message
- [ ] POST /graphql accepts { query: "..." } format
- [ ] Queries return data without errors
- [ ] Mutations create/update records successfully
- [ ] Invalid queries return GraphQL errors (not crashes)
- [ ] All 6 resolvers respond (MaterialType, Material, Users, MrForm, MrFormMaterial, DelLogs)

---

## Useful Tools

- **cURL**: Built-in CLI tool
- **Postman**: GUI REST client (https://www.postman.com)
- **Thunder Client**: VS Code extension
- **REST Client**: VS Code extension
- **GraphQL CLI**: Command-line tool for GraphQL (https://www.graphql-cli.com)

---

## Performance Testing

Test with complex nested queries:
```graphql
query {
  getMrForms {
    id
    ref_no
    subject
    creator_id
    mr_form_materials {
      quantity
      material {
        id
        title
        unit
        material_type {
          title
        }
      }
    }
  }
}
```

Check response time in your testing tool.

---

## Next Steps

1. ✅ Test GET endpoint
2. ✅ Test simple query
3. ✅ Test mutation
4. ✅ Build your application using the GraphQL API
5. ✅ Deploy to production
