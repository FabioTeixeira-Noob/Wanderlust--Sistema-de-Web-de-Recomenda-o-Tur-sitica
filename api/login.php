<?php
// ============================================================
//  WANDERLUST — Login
//  POST /api/login.php
//  Body JSON: { email, password }
// ============================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')    { json_error(405, 'Método não permitido.'); }

require_once __DIR__ . '/config.php';

// ── Ler corpo JSON ──────────────────────────────────────────
$body = json_decode(file_get_contents('php://input'), true);
if (!$body) { json_error(400, 'Corpo inválido.'); }

$email    = trim($body['email']    ?? '');
$password =      $body['password'] ?? '';

// ── Validação básica ────────────────────────────────────────
if (!$email || !$password) {
    json_error(422, 'Email e senha são obrigatórios.');
}

// ── Verificar credenciais ───────────────────────────────────
try {
    $db   = getDB();
    $stmt = $db->prepare('SELECT id, name, email, password, location, role FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // Mensagem genérica para não revelar se o email existe
    if (!$user || !password_verify($password, $user['password'])) {
        json_error(401, 'Email ou senha incorretos.');
    }

    // ── Resposta de sucesso ───────────────────────────────────
    echo json_encode([
        'success' => true,
        'message' => 'Login efetuado com sucesso.',
        'user'    => [
            'id'       => (int)$user['id'],
            'name'     => $user['name'],
            'email'    => $user['email'],
            'location' => $user['location'],
            'role'     => $user['role'] ?? 'user',
        ],
    ]);

} catch (PDOException $e) {
    json_error(500, 'Erro interno. Tente novamente.');
}

// ── Helper ───────────────────────────────────────────────────
function json_error(int $code, string $message): never {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}
