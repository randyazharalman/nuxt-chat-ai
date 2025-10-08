
export default defineEventHandler(async (event) => {
  const authUser = await requireAuth(event)

  try {
    let user = await db.user.findUnique({
      where: {
        logtoId: authUser.sub,
      },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          logtoId: authUser.sub,
          email: authUser.email,
        },
      });
    }

    return {
      id: user.id,
      email: user.email,
      logtoId: user.logtoId,
      createdAt: user.createdAt,
    };
  } catch (error) {
    console.error('Error in /api/auth/user:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get user information'
    })
  }
})
