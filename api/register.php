<?php
// ============================================================
//  WANDERLUST — Registo de conta
//  POST /api/register.php
//  Body JSON: { name, email, password, location? }
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

$name     = trim($body['name']     ?? '');
$email    = trim($body['email']    ?? '');
$password =      $body['password'] ?? '';
$location = trim($body['location'] ?? '');

// ── Validação ───────────────────────────────────────────────
$errors = [];

if (mb_strlen($name) < 2)              $errors['name']     = 'Nome deve ter pelo menos 2 caracteres.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Email inválido.';
if (strlen($password) < 6)             $errors['password'] = 'A senha deve ter pelo menos 6 caracteres.';

if ($errors) { json_error(422, 'Dados inválidos.', $errors); }

// ── Verificar email duplicado ────────────────────────────────
try {
    $db = getDB();

    $stmt = $db->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        json_error(409, 'Este email já está registado.');
    }

    // ── Criar utilizador ─────────────────────────────────────
    $hash = password_hash($password, PASSWORD_BCRYPT);

    $ins = $db->prepare(
        'INSERT INTO users (name, email, password, location) VALUES (?, ?, ?, ?)'
    );
    $ins->execute([$name, $email, $hash, $location ?: null]);

    $userId = $db->lastInsertId();

    // ── Resposta de sucesso ───────────────────────────────────
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Conta criada com sucesso.',
        'user'    => ['id' => (int)$userId, 'name' => $name, 'email' => $email],
    ]);

} catch (PDOException $e) {
    json_error(500, 'Erro interno. Tente novamente.');
}

// ── Helper ───────────────────────────────────────────────────
function json_error(int $code, string $message, array $errors = []): never {
    http_response_code($code);
    $payload = ['success' => false, 'message' => $message];
    if ($errors) $payload['errors'] = $errors;
    echo json_encode($payload);
    exit;
}
