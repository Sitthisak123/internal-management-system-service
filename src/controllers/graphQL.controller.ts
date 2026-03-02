import 'reflect-metadata';
import { ObjectType, Field, Int, Query, Resolver, Mutation, Arg, ID, InputType, Float } from 'type-graphql';
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

@InputType()
export class MaterialTypeInput {
  @Field(() => String)
  title!: string;
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

@InputType()
export class MaterialInput {
  @Field(() => String)
  title!: string;

  @Field(() => Int)
  material_type_id!: number;

  @Field(() => String)
  unit!: string;

  @Field(() => Int, { nullable: true })
  minimum_threshold?: number;

  @Field(() => Int, { defaultValue: 0 })
  quantity!: number;
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

@InputType()
export class UsersInput {
  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => String, { nullable: true })
  display_name?: string;

  @Field(() => String)
  fullname!: string;

  @Field(() => String)
  position!: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => Int, { defaultValue: 0 })
  role!: number;

  @Field(() => Int, { defaultValue: 0 })
  status!: number;
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

@InputType()
export class MrFormInput {
  @Field(() => String)
  ref_no!: string;

  @Field(() => String)
  subject!: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  purpose?: string;

  @Field(() => Int, { defaultValue: 0 })
  status!: number;

  @Field(() => Int)
  creator_id!: number;

  @Field(() => Int)
  owner_id!: number;

  @Field(() => Int, { nullable: true })
  authorizer_id?: number;
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

@InputType()
export class MrFormMaterialInput {
  @Field(() => Int)
  mr_form_id!: number;

  @Field(() => Int)
  material_id!: number;

  @Field(() => Int)
  quantity!: number;
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

@InputType()
export class DelLogsInput {
  @Field(() => String)
  table_name!: string;

  @Field(() => String)
  record!: any;

  @Field(() => Int, { nullable: true })
  deleted_by?: number;

  @Field(() => String, { nullable: true })
  note?: string;

  @Field(() => String, { nullable: true })
  effected_by?: bigint;
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

  @Query(() => MaterialTypeType, { nullable: true })
  async getMaterialTypeById(@Arg('id', () => Int) id: number): Promise<MaterialTypeType | null> {
    return await prisma.material_type.findUnique({
      where: { id },
      include: { material: true },
    });
  }

  @Mutation(() => MaterialTypeType)
  async createMaterialType(@Arg('input', () => MaterialTypeInput) input: MaterialTypeInput): Promise<MaterialTypeType> {
    return await prisma.material_type.create({
      data: {
        title: input.title,
      },
    });
  }

  @Mutation(() => MaterialTypeType)
  async updateMaterialType(
    @Arg('id', () => Int) id: number,
    @Arg('input', () => MaterialTypeInput) input: MaterialTypeInput
  ): Promise<MaterialTypeType> {
    return await prisma.material_type.update({
      where: { id },
      data: {
        title: input.title,
      },
    });
  }

  @Mutation(() => Boolean)
  async deleteMaterialType(@Arg('id', () => Int) id: number): Promise<boolean> {
    try {
      await prisma.material_type.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting material type:', error);
      return false;
    }
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

  @Query(() => MaterialType, { nullable: true })
  async getMaterialById(@Arg('id', () => Int) id: number): Promise<MaterialType | null> {
    return await prisma.material.findUnique({
      where: { id },
      include: { material_type: true, mr_form_materials: true },
    });
  }

  @Mutation(() => MaterialType)
  async createMaterial(@Arg('input', () => MaterialInput) input: MaterialInput): Promise<MaterialType> {
    return await prisma.material.create({
      data: {
        title: input.title,
        material_type_id: input.material_type_id,
        unit: input.unit,
        minimum_threshold: input.minimum_threshold,
        quantity: input.quantity,
      },
      include: { material_type: true },
    });
  }

  @Mutation(() => MaterialType)
  async updateMaterial(
    @Arg('id', () => Int) id: number,
    @Arg('input', () => MaterialInput) input: MaterialInput
  ): Promise<MaterialType> {
    return await prisma.material.update({
      where: { id },
      data: {
        title: input.title,
        material_type_id: input.material_type_id,
        unit: input.unit,
        minimum_threshold: input.minimum_threshold,
        quantity: input.quantity,
      },
      include: { material_type: true },
    });
  }

  @Mutation(() => Boolean)
  async deleteMaterial(@Arg('id', () => Int) id: number): Promise<boolean> {
    try {
      await prisma.material.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting material:', error);
      return false;
    }
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

  @Query(() => UsersType, { nullable: true })
  async getUserById(@Arg('id', () => Int) id: number): Promise<UsersType | null> {
    // @ts-ignore - Prisma returns null, TypeScript expects undefined
    return await prisma.users.findUnique({
      where: { id },
      include: {
        del_logs: true,
        mr_form_mr_form_authorizer_idTousers: true,
        mr_form_mr_form_creator_idTousers: true,
        mr_form: true,
      },
    });
  }

  @Query(() => UsersType, { nullable: true })
  async getUserByUsername(@Arg('username', () => String) username: string): Promise<UsersType | null> {
    // @ts-ignore - Prisma returns null, TypeScript expects undefined
    return await prisma.users.findUnique({
      where: { username },
      include: {
        del_logs: true,
        mr_form_mr_form_authorizer_idTousers: true,
        mr_form_mr_form_creator_idTousers: true,
        mr_form: true,
      },
    });
  }

  @Mutation(() => UsersType)
  async createUser(@Arg('input', () => UsersInput) input: UsersInput): Promise<UsersType> {
    // @ts-ignore - Prisma returns null, TypeScript expects undefined
    return await prisma.users.create({
      data: {
        username: input.username,
        display_name: input.display_name,
        fullname: input.fullname,
        position: input.position,
        email: input.email,
        role: input.role,
        status: input.status,
      },
    });
  }

  @Mutation(() => UsersType)
  async updateUser(
    @Arg('id', () => Int) id: number,
    @Arg('input', () => UsersInput) input: UsersInput
  ): Promise<UsersType> {
    // @ts-ignore - Prisma returns null, TypeScript expects undefined
    return await prisma.users.update({
      where: { id },
      data: {
        username: input.username,
        display_name: input.display_name,
        fullname: input.fullname,
        position: input.position,
        email: input.email,
        role: input.role,
        status: input.status,
      },
    });
  }

  @Mutation(() => Boolean)
  async deleteUser(@Arg('id', () => Int) id: number): Promise<boolean> {
    try {
      await prisma.users.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
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

  @Query(() => MrFormType, { nullable: true })
  async getMrFormById(@Arg('id', () => Int) id: number): Promise<MrFormType | null> {
    // @ts-ignore - Prisma returns null, TypeScript expects undefined
    return await prisma.mr_form.findUnique({
      where: { id },
      include: {
        users_mr_form_authorizer_idTousers: true,
        users_mr_form_creator_idTousers: true,
        personnel: true,
        mr_form_materials: true,
      },
    });
  }

  @Query(() => MrFormType, { nullable: true })
  async getMrFormByRefNo(@Arg('ref_no', () => String) ref_no: string): Promise<MrFormType | null> {
    // @ts-ignore - Prisma returns null, TypeScript expects undefined
    return await prisma.mr_form.findUnique({
      where: { ref_no },
      include: {
        users_mr_form_authorizer_idTousers: true,
        users_mr_form_creator_idTousers: true,
        personnel: true,
        mr_form_materials: true,
      },
    });
  }

  @Mutation(() => MrFormType)
  async createMrForm(@Arg('input', () => MrFormInput) input: MrFormInput): Promise<MrFormType> {
    // @ts-ignore - Prisma returns null, TypeScript expects undefined
    return await prisma.mr_form.create({
      data: {
        ref_no: input.ref_no,
        subject: input.subject,
        description: input.description,
        purpose: input.purpose,
        status: input.status,
        creator_id: input.creator_id,
        owner_id: input.owner_id,
        authorizer_id: input.authorizer_id,
      },
      include: {
        users_mr_form_authorizer_idTousers: true,
        users_mr_form_creator_idTousers: true,
        personnel: true,
        mr_form_materials: true,
      },
    });
  }

  @Mutation(() => MrFormType)
  async updateMrForm(
    @Arg('id', () => Int) id: number,
    @Arg('input', () => MrFormInput) input: MrFormInput
  ): Promise<MrFormType> {
    // @ts-ignore - Prisma returns null, TypeScript expects undefined
    return await prisma.mr_form.update({
      where: { id },
      data: {
        ref_no: input.ref_no,
        subject: input.subject,
        description: input.description,
        purpose: input.purpose,
        status: input.status,
        creator_id: input.creator_id,
        owner_id: input.owner_id,
        authorizer_id: input.authorizer_id,
      },
      include: {
        users_mr_form_authorizer_idTousers: true,
        users_mr_form_creator_idTousers: true,
        personnel: true,
        mr_form_materials: true,
      },
    });
  }

  @Mutation(() => Boolean)
  async deleteMrForm(@Arg('id', () => Int) id: number): Promise<boolean> {
    try {
      await prisma.mr_form.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting MR form:', error);
      return false;
    }
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

  @Query(() => MrFormMaterialType, { nullable: true })
  async getMrFormMaterialById(@Arg('id', () => Int) id: number): Promise<MrFormMaterialType | null> {
    // @ts-ignore - Prisma returns null, TypeScript expects undefined
    return await prisma.mr_form_materials.findUnique({
      where: { id },
      include: { material: true, mr_form: true },
    });
  }

  @Query(() => [MrFormMaterialType])
  async getMaterialsByMrFormId(@Arg('mr_form_id', () => Int) mr_form_id: number): Promise<MrFormMaterialType[]> {
    // @ts-ignore - Prisma returns null, TypeScript expects undefined
    return await prisma.mr_form_materials.findMany({
      where: { mr_form_id },
      include: { material: true, mr_form: true },
    });
  }

  @Mutation(() => MrFormMaterialType)
  async createMrFormMaterial(@Arg('input', () => MrFormMaterialInput) input: MrFormMaterialInput): Promise<MrFormMaterialType> {
    // @ts-ignore - Prisma returns null, TypeScript expects undefined
    return await prisma.mr_form_materials.create({
      data: {
        mr_form_id: input.mr_form_id,
        material_id: input.material_id,
        quantity: input.quantity,
      },
      include: { material: true, mr_form: true },
    });
  }

  @Mutation(() => MrFormMaterialType)
  async updateMrFormMaterial(
    @Arg('id', () => Int) id: number,
    @Arg('input', () => MrFormMaterialInput) input: MrFormMaterialInput
  ): Promise<MrFormMaterialType> {
    // @ts-ignore - Prisma returns null, TypeScript expects undefined
    return await prisma.mr_form_materials.update({
      where: { id },
      data: {
        mr_form_id: input.mr_form_id,
        material_id: input.material_id,
        quantity: input.quantity,
      },
      include: { material: true, mr_form: true },
    });
  }

  @Mutation(() => Boolean)
  async deleteMrFormMaterial(@Arg('id', () => Int) id: number): Promise<boolean> {
    try {
      await prisma.mr_form_materials.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting MR form material:', error);
      return false;
    }
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

  @Query(() => DelLogsType, { nullable: true })
  async getDelLogsById(@Arg('id', () => String) id: string): Promise<DelLogsType | null> {
    // @ts-ignore - Prisma returns null, TypeScript expects undefined
    return await prisma.del_logs.findUnique({
      where: { id: BigInt(id) },
      include: {
        users: true,
        del_logs: true,
        other_del_logs: true,
      },
    });
  }

  @Query(() => [DelLogsType])
  async getDelLogsByTableName(@Arg('table_name', () => String) table_name: string): Promise<DelLogsType[]> {
    // @ts-ignore - Prisma returns null, TypeScript expects undefined
    return await prisma.del_logs.findMany({
      where: { table_name },
      include: {
        users: true,
        del_logs: true,
        other_del_logs: true,
      },
    });
  }

  @Mutation(() => DelLogsType)
  async createDelLog(@Arg('input', () => DelLogsInput) input: DelLogsInput): Promise<DelLogsType> {
    // @ts-ignore - Prisma returns null, TypeScript expects undefined
    return await prisma.del_logs.create({
      data: {
        table_name: input.table_name,
        record: input.record,
        deleted_by: input.deleted_by,
        note: input.note,
        effected_by: input.effected_by ? BigInt(input.effected_by) : undefined,
      },
      include: {
        users: true,
        del_logs: true,
        other_del_logs: true,
      },
    });
  }

  @Mutation(() => Boolean)
  async deleteDelLog(@Arg('id', () => String) id: string): Promise<boolean> {
    try {
      await prisma.del_logs.delete({
        where: { id: BigInt(id) },
      });
      return true;
    } catch (error) {
      console.error('Error deleting log entry:', error);
      return false;
    }
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
