export async function POST({ cookies }) {
    cookies.delete('session', { path: '/' });
    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            Location: '/'
        }
    });
}
