// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      password: string
      phone: string
      status: boolean
      created_at: Date
      updated_at: Date
      deleted_at?: Date
    }
    meals: {
      id: string
      name: string
      description?: string
      date_and_time_of_meal: Date
      user_id: string
      from_diet: boolean
      created_at: Date
      updated_at: Date
      deleted_at?: Date
    }
  }
}
