CREATE TABLE `users_table` (
	`id` text PRIMARY KEY NOT NULL,
	`user_name` text NOT NULL,
	`email` text NOT NULL,
	`avatar_url` text,
	`age` integer,
	`role` text DEFAULT 'STUDENT' NOT NULL,
	`coin_balance` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_table_email_unique` ON `users_table` (`email`);