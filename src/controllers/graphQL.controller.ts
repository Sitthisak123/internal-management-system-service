import 'reflect-metadata';
import { ObjectType, Field, Int, Query, Resolver } from 'type-graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import createPrismaClient from '../utils/db';

const prisma = createPrismaClient();

// ============================================
// OBJECT TYPES - Material Type
// ============================================
@ObjectType()
export class MaterialTypeType {
  @Field(() => Int)
  id!: number;

  @Field(() => String)
  title!: string;

  @Field(() => GraphQLDateTime)
  created_at!: Date;

  @Field(() => GraphQLDateTime)
  updated_at!: Date;

  @Field(() => [MaterialType], { nullable: true })
  material?: MaterialType[];
}

// ============================================
// OBJECT TYPES - Material
// ============================================
@ObjectType()
export class MaterialType {
  @Field(() => Int)
  id!: number;

  @Field(() => String)
  title!: string;

  @Field(() => Int)
  material_type_id!: number;

  @Field(() => String)
  unit!: string;

  @Field(() => Int, { nullable: true })
  minimum_threshold?: number | null;

  @Field(() => Int)
  quantity!: number;

  @Field(() => GraphQLDateTime)
  created_at!: Date;

  @Field(() => GraphQLDateTime)
  updated_at!: Date;

  @Field(() => MaterialTypeType, { nullable: true })
  material_type?: MaterialTypeType;

  @Field(() => [MrFormMaterialType], { nullable: true })
  mr_form_materials?: MrFormMaterialType[];
}

// ============================================
// OBJECT TYPES - Users (Personnel)
// ============================================
@ObjectType()
export class UsersType {
  @Field(() => Int)
  id!: number;

  @Field(() => String, { nullable: true })
  username?: string | null;

  @Field(() => String, { nullable: true })
  display_name?: string | null;

  @Field(() => String)
  fullname!: string;

  @Field(() => String)
  position!: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => Int)
  role!: number;

  @Field(() => Int)
  status!: number;

  @Field(() => GraphQLDateTime)
  created_at!: Date;

  @Field(() => GraphQLDateTime)
  updated_at!: Date;

  @Field(() => [DelLogsType], { nullable: true })
  del_logs?: DelLogsType[];

  @Field(() => [MrFormType], { nullable: true })
  mr_form_mr_form_authorizer_idTousers?: MrFormType[];

  @Field(() => [MrFormType], { nullable: true })
  mr_form_mr_form_creator_idTousers?: MrFormType[];

  @Field(() => [MrFormType], { nullable: true })
  mr_form?: MrFormType[];
}

// ============================================
// OBJECT TYPES - MR Form
// ============================================
@ObjectType()
export class MrFormType {
  @Field(() => Int)
  id!: number;

  @Field(() => String)
  ref_no!: string;

  @Field(() => String)
  subject!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  purpose?: string;

  @Field(() => Int)
  status!: number;

  @Field(() => GraphQLDateTime)
  form_date!: Date;

  @Field(() => GraphQLDateTime)
  created_at!: Date;

  @Field(() => GraphQLDateTime)
  updated_at!: Date;

  @Field(() => Int)
  creator_id!: number;

  @Field(() => Int)
  owner_id!: number;

  @Field(() => Int, { nullable: true })
  authorizer_id?: number;

  @Field(() => UsersType, { nullable: true })
  users_mr_form_authorizer_idTousers?: UsersType;

  @Field(() => UsersType, { nullable: true })
  users_mr_form_creator_idTousers?: UsersType;

  @Field(() => UsersType, { nullable: true })
  personnel?: UsersType;

  @Field(() => [MrFormMaterialType], { nullable: true })
  mr_form_materials?: MrFormMaterialType[];
}

// ============================================
// OBJECT TYPES - MR Form Materials
// ============================================
@ObjectType()
export class MrFormMaterialType {
  @Field(() => Int)
  id!: number;

  @Field(() => Int)
  mr_form_id!: number;

  @Field(() => Int)
  material_id!: number;

  @Field(() => Int)
  quantity!: number;

  @Field(() => MaterialType, { nullable: true })
  material?: MaterialType;

  @Field(() => MrFormType, { nullable: true })
  mr_form?: MrFormType;
}

// ============================================
// OBJECT TYPES - Deletion Logs
// ============================================
@ObjectType()
export class DelLogsType {
  @Field(() => String)
  id!: bigint;

  @Field(() => String)
  table_name!: string;

  @Field(() => String) // JSON serialized as string
  record!: any;

  @Field(() => Int, { nullable: true })
  deleted_by?: number;

  @Field(() => String, { nullable: true })
  note?: string;

  @Field(() => String, { nullable: true })
  effected_by?: bigint;

  @Field(() => GraphQLDateTime)
  created_at!: Date;

  @Field(() => UsersType, { nullable: true })
  users?: UsersType;

  @Field(() => DelLogsType, { nullable: true })
  del_logs?: DelLogsType;

  @Field(() => [DelLogsType], { nullable: true })
  other_del_logs?: DelLogsType[];
}

// ============================================
// RESOLVERS - Material Type
// ============================================
@Resolver(() => MaterialTypeType)
export class MaterialTypeResolver {
  @Query(() => [MaterialTypeType])
  async getMaterialTypes(): Promise<MaterialTypeType[]> {
    return await prisma.material_type.findMany({
      include: { material: true },
    });
  }
}

// ============================================
// RESOLVERS - Material
// ============================================
@Resolver(() => MaterialType)
export class MaterialResolver {
  @Query(() => [MaterialType])
  async getMaterials(): Promise<MaterialType[]> {
    return await prisma.material.findMany({
      include: { material_type: true, mr_form_materials: true },
    });
  }
}

// ============================================
// RESOLVERS - Users
// ============================================
@Resolver(() => UsersType)
export class UsersResolver {
  @Query(() => [UsersType])
  async getUsers(): Promise<UsersType[]> {
    // @ts-ignore - Prisma returns null, TypeScript expects undefined
    return await prisma.users.findMany({
      include: {
        del_logs: true,
        mr_form_mr_form_authorizer_idTousers: true,
        mr_form_mr_form_creator_idTousers: true,
        mr_form: true,
      },
    });
  }
}

// ============================================
// RESOLVERS - MR Form
// ============================================
@Resolver(() => MrFormType)
export class MrFormResolver {
  @Query(() => [MrFormType])
  async getMrForms(): Promise<MrFormType[]> {
    // @ts-ignore - Prisma returns null, TypeScript expects undefined
    return await prisma.mr_form.findMany({
      include: {
        users_mr_form_authorizer_idTousers: true,
        users_mr_form_creator_idTousers: true,
        personnel: true,
        mr_form_materials: true,
      },
    });
  }
}

// ============================================
// RESOLVERS - MR Form Materials
// ============================================
@Resolver(() => MrFormMaterialType)
export class MrFormMaterialResolver {
  @Query(() => [MrFormMaterialType])
  async getMrFormMaterials(): Promise<MrFormMaterialType[]> {
    // @ts-ignore - Prisma returns null, TypeScript expects undefined
    return await prisma.mr_form_materials.findMany({
      include: { material: true, mr_form: true },
    });
  }
}

// ============================================
// RESOLVERS - Deletion Logs
// ============================================
@Resolver(() => DelLogsType)
export class DelLogsResolver {
  @Query(() => [DelLogsType])
  async getDelLogs(): Promise<DelLogsType[]> {
    // @ts-ignore - Prisma returns null, TypeScript expects undefined
    return await prisma.del_logs.findMany({
      include: {
        users: true,
        del_logs: true,
        other_del_logs: true,
      },
    });
  }
}

// Export all resolvers
export const AllResolvers = [
  MaterialTypeResolver,
  MaterialResolver,
  UsersResolver,
  MrFormResolver,
  MrFormMaterialResolver,
  DelLogsResolver,
];
