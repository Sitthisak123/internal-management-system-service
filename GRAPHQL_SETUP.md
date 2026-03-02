# GraphQL Setup with TypeGraphQL

## Overview
This project now includes a complete GraphQL API using TypeGraphQL and Apollo Server, with type-safe resolvers for all Prisma models.

## Installed Packages
- `type-graphql` - TypeScript library for building GraphQL schemas with decorators
- `apollo-server-express` - Apollo Server integration for Express
- `graphql` - GraphQL query language implementation
- `reflect-metadata` - Required for TypeGraphQL decorators
- `class-validator` - Validation utilities
- `graphql-scalars` - Custom GraphQL scalar types (including DateTime)

## GraphQL Types & Resolvers

### 1. **Material Type**
**File:** `src/controllers/graphQL.controller.ts`

**Resolvers:**
- `getMaterialTypes()` - Get all material types
- `getMaterialTypeById(id)` - Get material type by ID
- `createMaterialType(input)` - Create new material type
- `updateMaterialType(id, input)` - Update material type
- `deleteMaterialType(id)` - Delete material type

---

### 2. **Material**
**Resolvers:**
- `getMaterials()` - Get all materials with type and form materials
- `getMaterialById(id)` - Get material by ID
- `createMaterial(input)` - Create new material
- `updateMaterial(id, input)` - Update material
- `deleteMaterial(id)` - Delete material

**Fields:**
- `id`, `title`, `material_type_id`, `unit`
- `minimum_threshold` (nullable), `quantity`
- `created_at`, `updated_at`
- Relations: `material_type`, `mr_form_materials`

---

### 3. **Users (Personnel)**
**Resolvers:**
- `getUsers()` - Get all users with relationships
- `getUserById(id)` - Get user by ID
- `getUserByUsername(username)` - Get user by username
- `createUser(input)` - Create new user
- `updateUser(id, input)` - Update user
- `deleteUser(id)` - Delete user

**Fields:**
- `id`, `username` (nullable), `fullname`, `position`
- `display_name` (nullable), `email` (nullable)
- `role`, `status`
- `created_at`, `updated_at`
- Relations: `del_logs`, `mr_form_*` (various relationships)

---

### 4. **Material Request Form (MR Form)**
**Resolvers:**
- `getMrForms()` - Get all forms with relationships
- `getMrFormById(id)` - Get form by ID
- `getMrFormByRefNo(ref_no)` - Get form by reference number
- `createMrForm(input)` - Create new form
- `updateMrForm(id, input)` - Update form
- `deleteMrForm(id)` - Delete form

**Fields:**
- `id`, `ref_no` (unique), `subject`
- `description`, `purpose` (nullable)
- `status` (-1: Rejected, 0: Pending, 1: Approved)
- `form_date`, `created_at`, `updated_at`
- `creator_id`, `owner_id`, `authorizer_id` (nullable)
- Relations: `users_mr_form_*`, `personnel`, `mr_form_materials`

---

### 5. **MR Form Materials**
**Resolvers:**
- `getMrFormMaterials()` - Get all form materials
- `getMrFormMaterialById(id)` - Get material entry by ID
- `getMaterialsByMrFormId(mr_form_id)` - Get all materials for a form
- `createMrFormMaterial(input)` - Create form material entry
- `updateMrFormMaterial(id, input)` - Update quantity
- `deleteMrFormMaterial(id)` - Remove material from form

**Fields:**
- `id`, `mr_form_id`, `material_id`, `quantity`
- Relations: `material`, `mr_form`
- Unique constraint: `(mr_form_id, material_id)`

---

### 6. **Deletion Logs**
**Resolvers:**
- `getDelLogs()` - Get all deletion logs
- `getDelLogsById(id)` - Get log entry by ID
- `getDelLogsByTableName(table_name)` - Get logs for specific table
- `createDelLog(input)` - Create deletion log
- `deleteDelLog(id)` - Delete log entry

**Fields:**
- `id` (BigInt), `table_name`, `record` (JSON)
- `deleted_by` (user ID, nullable), `note` (nullable)
- `effected_by` (BigInt, nullable)
- `created_at`
- Relations: `users`, `del_logs` (self-referencing)

---

## Usage

### Starting the Server
```bash
npm run dev
```

The GraphQL endpoint will be available at:
```
http://localhost:3000/graphql
```

### Example GraphQL Query
```graphql
query {
  getMaterialTypes {
    id
    title
    created_at
    material {
      id
      title
      unit
      quantity
    }
  }
}
```

### Example GraphQL Mutation
```graphql
mutation {
  createMaterial(input: {
    title: "Steel Plate"
    material_type_id: 1
    unit: "kg"
    minimum_threshold: 100
    quantity: 500
  }) {
    id
    title
    quantity
  }
}
```

## Files Created/Modified

1. **Created:** `src/controllers/graphQL.controller.ts`
   - All TypeGraphQL Object types, Input types, and Resolvers

2. **Created:** `src/routes/graphQL.routes.ts`
   - Apollo Server setup and Express middleware integration

3. **Modified:** `src/index.ts`
   - Integrated Apollo Server with Express application
   - Added GraphQL endpoint at `/graphql`

4. **Modified:** `tsconfig.json`
   - Enabled `experimentalDecorators` for TypeGraphQL support
   - Enabled `emitDecoratorMetadata`
   - Added `skipLibCheck` to suppress some type warnings

5. **Modified:** `src/utils/db.ts`
   - Fixed Prisma client instantiation to properly handle singleton pattern

## TypeScript Configuration
The project now includes:
- `experimentalDecorators: true` - Required for TypeGraphQL decorators
- `emitDecoratorMetadata: true` - Metadata emission for runtime reflection
- `skipLibCheck: true` - Suppress type checking in node_modules

## Notes
- All nullable fields that Prisma returns as `null` are properly marked with `{ nullable: true `}
- Type assertions (`@ts-ignore`) are used where Prisma returns `null` instead of `undefined`
- The GraphQL schema is auto-generated and can be found at `schema.graphql` after first run
- All resolvers include proper error handling and logging

## Testing with GraphQL Playground
Once the server is running, GraphQL Playground/Apollo Sandbox is available at:
```
http://localhost:3000/graphql
```

Use the query explorer on the left to browse available queries and mutations.
