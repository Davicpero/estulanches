<nav>
    <b>🥪 EstuLanches</b>
    <a href="painel.php">Início</a>
    <a href="cardapio.php">Cardápio</a>
    <a href="pedidos.php">Pedidos</a>
    <span>Usuário: <b><?= htmlspecialchars($_SESSION['nome']) ?></b></span>
    <a href="logout.php" class="sair">Sair</a>
</nav>
