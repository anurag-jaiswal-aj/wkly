import { withSupabase } from 'npm:@supabase/server@1'

export default {
  fetch: withSupabase(
    { auth: 'user' },
    async (_req, ctx) => {
      try {
        const userId = ctx.userClaims?.sub
        
        if (!userId) {
          return new Response(JSON.stringify({ error: 'Unauthorized: Missing user identity' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          })
        }

        // Delete the authenticated caller's user account
        // Relying on PostgreSQL ON DELETE CASCADE to remove user data
        const { error: deleteError } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId)
        
        if (deleteError) {
          throw deleteError
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      } catch (error) {
        console.error('Account deletion error:', error)
        return new Response(JSON.stringify({ error: 'Failed to delete account' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }
  )
}
