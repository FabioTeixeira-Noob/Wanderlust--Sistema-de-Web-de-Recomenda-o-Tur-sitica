<?php
// ============================================================
//  WANDERLUST — Favoritos
//  GET    /api/favorites.php?user_id=1   → listar favoritos
//  POST   /api/favorites.php             → adicionar favorito
//  DELETE /api/favorites.php             → remover favorito
//
//  Body POST/DELETE JSON: { user_id, destination_id }
// ============================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $db = getDB();

    // ── GET — listar favoritos do utilizador ─────────────────
    if ($method === 'GET') {
        $userId = filter_input(INPUT_GET, 'user_id', FILTER_VALIDATE_INT);
        if (!$userId) json_error(400, 'user_id inválido.');

        $stmt = $db->prepare('SELECT destination_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC');
        $stmt->execute([$userId]);
        $rows = $stmt->fetchAll();

        echo json_encode([
            'success'      => true,
            'favorites'    => array_column($rows, 'destination_id'),
        ]);
        exit;
    }

    // ── POST/DELETE — ler body ───────────────────────────────
    $body = json_decode(file_get_contents('php://input'), true);
    $userId      = (int)($body['user_id']        ?? 0);
    $destId      = (int)($body['destination_id'] ?? 0);

    if (!$userId || !$destId) json_error(400, 'user_id e destination_id são obrigatórios.');

    // ── POST — adicionar favorito ────────────────────────────
    if ($method === 'POST') {
        // Ignorar duplicado silenciosamente
        $stmt = $db->prepare('INSERT IGNORE INTO favorites (user_id, destination_id) VALUES (?, ?)');
        $stmt->execute([$userId, $destId]);

        echo json_encode(['success' => true, 'message' => 'Destino guardado nos favoritos.']);
        exit;
    }

    // ── DELETE — remover favorito ────────────────────────────
    if ($method === 'DELETE') {
        $stmt = $db->prepare('DELETE FROM favorites WHERE user_id = ? AND destination_id = ?');
        $stmt->execute([$userId, $destId]);

        echo json_encode(['success' => true, 'message' => 'Removido dos favoritos.']);
        exit;
    }

    json_error(405, 'Método não permitido.');

} catch (PDOException $e) {
    json_error(500, 'Erro interno. Tente novamente.');
}

function json_error(int $code, string $message): never {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}
