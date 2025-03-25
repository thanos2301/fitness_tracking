/*
  Warnings:

  - You are about to drop the `DietPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Exercise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Progress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SupportMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Workout` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkoutExercise` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DietPlan" DROP CONSTRAINT "DietPlan_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Progress" DROP CONSTRAINT "Progress_userId_fkey";

-- DropForeignKey
ALTER TABLE "SupportMessage" DROP CONSTRAINT "SupportMessage_userId_fkey";

-- DropForeignKey
ALTER TABLE "Workout" DROP CONSTRAINT "Workout_userId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutExercise" DROP CONSTRAINT "WorkoutExercise_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutExercise" DROP CONSTRAINT "WorkoutExercise_workoutId_fkey";

-- DropTable
DROP TABLE "DietPlan";

-- DropTable
DROP TABLE "Exercise";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "Progress";

-- DropTable
DROP TABLE "SupportMessage";

-- DropTable
DROP TABLE "Workout";

-- DropTable
DROP TABLE "WorkoutExercise";
