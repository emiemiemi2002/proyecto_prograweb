<?php
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "farmacia_el_nayar";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$searchTerm = isset($_GET['q']) ? $_GET['q'] : '';
$categoria = isset($_GET['categoria']) ? $_GET['categoria'] : '';

$sql = "SELECT * FROM productos WHERE 
        (nombre LIKE ? OR descripcion LIKE ?)";
$params = ["%$searchTerm%", "%$searchTerm%"];
$types = "ss";

if (!empty($categoria) && $categoria != 'Todas las categorías') {
    $sql .= " AND categoria = ?";
    $params[] = $categoria;
    $types .= "s";
}

$sql .= " ORDER BY stock DESC LIMIT 20";

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$products = [];
while($row = $result->fetch_assoc()) {
    $row['badge'] = $row['stock'] > 10 ? 'bg-success' : ($row['stock'] > 0 ? 'bg-warning' : 'bg-danger');
    $row['badge_text'] = $row['stock'] > 10 ? 'En stock' : ($row['stock'] > 0 ? 'Últimas unidades' : 'Sin stock');
    $products[] = $row;
}

$conn->close();
echo json_encode($products);
?>