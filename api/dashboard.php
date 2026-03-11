<?php
// ============================================================
//  WANDERLUST — Estatísticas do Dashboard
//  GET /api/dashboard.php?user_id=1
//
//  Retorna: total de favoritos, destinos explorados, compatibilidade
// ============================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') { json_error(405, 'Método não permitido.'); }

require_once __DIR__ . '/config.php';

$userId = filter_input(INPUT_GET, 'user_id', FILTER_VALIDATE_INT);
if (!$userId) json_error(400, 'user_id inválido.');

try {
    $db = getDB();

    // Total de favoritos
    $stmt = $db->prepare('SELECT COUNT(*) AS total FROM favorites WHERE user_id = ?');
    $stmt->execute([$userId]);
    $totalFavorites = (int)$stmt->fetchColumn();

    // Preferências do utilizador (para calcular compatibilidade)
    $stmt = $db->prepare('SELECT categories FROM preferences WHERE user_id = ? LIMIT 1');
    $stmt->execute([$userId]);
    $prefsRow   = $stmt->fetch();
    $categories = $prefsRow ? (json_decode($prefsRow['categories'], true) ?? []) : [];

    // Compatibilidade: quanto mais preferências definidas, maior o valor (máx 97%)
    $compatibility = count($categories) >= 3 ? 97 : (count($categories) >= 1 ? 85 : 70);

    echo json_encode([
        'success' => true,
        'stats'   => [
            'favorites'     => $totalFavorites,
            'explored'      => 12,          // futuramente via tabela explored_destinations
            'avg_rating'    => 4.9,
            'compatibility' => $compatibility,
        ],
    ]);

} catch (PDOException $e) {
    json_error(500, 'Erro interno. Tente novamente.');
}

function json_error(int $code, string $message): never {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}
