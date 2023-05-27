import { knex } from '../database'

// Function to obtain the total amount of registered meals
export async function getTotalMealCount(userId: string): Promise<number> {
  const result = await knex('meals')
    .count('id as count')
    .where({ user_id: userId })
    .first()
  const count = Number(result?.count) || 0
  return count
}

// Function to obtain the total amount of meals within the diet
export async function getDietMealCount(userId: string): Promise<number> {
  const result = await knex('meals')
    .count('id as count')
    .where({ user_id: userId, from_diet: true })
    .first()
  const count = Number(result?.count) || 0
  return count
}

// Function to get the total amount of meals outside the diet
export async function getNonDietMealCount(userId: string): Promise<number> {
  const result = await knex('meals')
    .count('id as count')
    .where({ user_id: userId, from_diet: false })
    .first()
  const count = Number(result?.count) || 0
  return count
}

// Function to get the best sequence of meals within the diet per day
export async function getBestDietSequence(userId: string): Promise<number> {
  const result = await knex.raw(
    `
    SELECT MAX(consecutive_meals) AS best_sequence
    FROM (
      SELECT COUNT(*) AS consecutive_meals
      FROM meals
      WHERE user_id = ?
        AND from_diet = true
      GROUP BY date(date_and_time_of_meal)
    ) AS sequences
  `,
    [userId],
  )

  return result[0].best_sequence || 0
}
