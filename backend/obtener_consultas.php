<?php
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "farmacia_el_nayar";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode([]));
}

$idUsuario = isset($_GET['id_usuario']) ? intval($_GET['id_usuario']) : 0;

$sql = "SELECT id_consulta, asunto, mensaje, adjunto_url, fecha_consulta, respuesta, fecha_respuesta 
        FROM consultas 
        WHERE id_usuario = ? 
        ORDER BY fecha_consulta DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $idUsuario);
$stmt->execute();
$result = $stmt->get_result();

$consultas = [];
while ($row = $result->fetch_assoc()) {
    $consultas[] = $row;
}

echo json_encode($consultas);

$stmt->close();
$conn->close();
?>