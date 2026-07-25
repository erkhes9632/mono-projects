import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { projectsTable, usersTable } from '../../../db/schema';
import { MutationResolvers, ProjectStatus, Role } from '../../../types';
import { insertNotification } from './manage-notification';

export const reviewProject: MutationResolvers['reviewProject'] = async (
  _,
  { projectId, status },
  { db, userId },
) => {
  if (!userId) {
    throw new GraphQLError('You need to SignIn', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  try {
    const [currentUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!currentUser || currentUser.role !== Role.TEACHER) {
      throw new GraphQLError('You do not have permission', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId));

    if (!project) {
      throw new GraphQLError('No project found');
    }

    const [updatedProject] = await db
      .update(projectsTable)
      .set({
        status: status,
        reviewedById: userId,
      })
      .where(eq(projectsTable.id, projectId))
      .returning();

    // Insert notification for the project creator
    const isApproved = status === ProjectStatus.APPROVED;
    await insertNotification(
      db,
      project.creatorId,
      'PROJECT_REVIEWED',
      isApproved ? 'Project Approved! 🎉' : 'Project Status Update',
      isApproved
        ? `Your project "${project.title}" has been approved by a teacher. Students can now support it with coins!`
        : `Your project "${project.title}" has been reviewed but was not approved at this time. You can review the feedback and resubmit.`,
      projectId,
    );

    // D1 / SQLite Images аюулгүй парс хийх
    let parsedImages: string[] = [];
    if (Array.isArray(updatedProject.images)) {
      parsedImages = updatedProject.images;
    } else if (typeof updatedProject.images === 'string') {
      try {
        parsedImages = JSON.parse(updatedProject.images);
      } catch {
        parsedImages = [];
      }
    }

    return {
      id: updatedProject.id,
      title: updatedProject.title,
      description: updatedProject.description,
      images: parsedImages,
      creatorId: updatedProject.creatorId,
      status: updatedProject.status as ProjectStatus,
      reviewedById: updatedProject.reviewedById,
      totalCoinsCollected: updatedProject.totalCoinsCollected,
      createdAt: String(updatedProject.createdAt),
      updatedAt: String(updatedProject.updatedAt),
    };
  } catch (err: unknown) {
    if (err instanceof GraphQLError) throw err;
    throw new GraphQLError(err instanceof Error ? err.message : 'System error');
  }
};
