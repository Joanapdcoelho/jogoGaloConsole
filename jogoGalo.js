const prompt = require('prompt-sync')({ sigint: true });
const fs = require('fs');

// Função para exibir o tabuleiro
function mostrarTabuleiro(tabuleiro) {
    for (let i = 0; i < tabuleiro.length; i++) {
        let linhaCaracteres = "";
        for (let j = 0; j < tabuleiro[i].length; j++) {
            linhaCaracteres += tabuleiro[i][j];

            if (j + 1 != tabuleiro[i].length) {
                linhaCaracteres += " |";
            }
        }
        console.log(linhaCaracteres);
    }
}

// Função para exibir o menu
function exibirMenu() {
    console.log("\n======= Jogo do galo =======\n");
    console.log("-----------------------------------");
    console.log('1. Novo Jogo - dois jogadores');
    console.log('2. Novo Jogo - contra o computador');
    console.log('3. Sair');
    console.log("-----------------------------------\n");

    let inputPrompt = prompt("Escolha uma opção: ");

    if (inputPrompt == "1") {
        jogarJogoDoGalo(false); // Chamar a função para iniciar o jogo com dois jogadores
    } 
    else if (inputPrompt == "2") {
        jogarJogoDoGalo(true); // Chamar a função para iniciar o jogo contra o computador
    } 
    else if (inputPrompt == "3") {
        console.log('\nObrigada por jogar! Até à próxima!');
    } 
    else {
        console.log('\nOpção inválida. Por favor, escolha uma opção válida.');
        exibirMenu(); // Chamar novamente o menu em caso de opção inválida
    }   
}

// Função para carregar o arquivo JSON de pontuações
function carregarPontuacoes() {
    try {
        const data = fs.readFileSync('pontuacoes.json', 'utf8');
        return JSON.parse(data);
    } catch (err) {
        // Se o arquivo não existir, retorna um objeto vazio
        return {};
    }
}

// Função para salvar as pontuações no arquivo JSON
function salvarPontuacoes(pontuacoes) {
    const data = JSON.stringify(pontuacoes, null, 4);
    fs.writeFileSync('pontuacoes.json', data);
}

// Função para exibir as pontuações dos jogadores
function exibirPontuacoes(pontuacoes) {
    console.log("\n======= Pontuações =======\n");
    for (let jogador in pontuacoes) {
        console.log(jogador + ": " + pontuacoes[jogador] + "vitória(s)");
        // console.log(`${jogador}: ${pontuacoes[jogador]} vitória(s)`);
    }
    console.log("--------------------------\n");
}

// Função principal do jogo
function jogarJogoDoGalo(contraComputador) {
    let pontuacoes = carregarPontuacoes();
    let jogador1 = {       
        nome: prompt("Jogador 1, por favor, insira o seu nome: "),
        caracter: prompt("Jogador 1, escolha o caracter que deseja usar: ").toUpperCase()
    };
    
    let jogador2;
    if (contraComputador) {
        jogador2 = {
            nome: "Computador",
            caracter: jogador1.caracter === "X" ? "O" : "X" // Caracter diferente do jogador 1
        };
    } 
    else {
        jogador2 = {
            nome: prompt("Jogador 2, por favor, insira o seu nome: "),
            caracter: prompt("Jogador 2, escolha o caracter que deseja usar: ").toUpperCase()
        };
    }

    let tabuleiro = [
        [' ', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', ' ']
    ];

    let jogadorAtual = jogador1;

    while (true) {
        // permitir que o jogador atual faça a sua jogada no tabuleiro
        console.log("Jogador: " + jogadorAtual.nome);

        if (jogadorAtual === jogador1 || !contraComputador) {
            fazerJogada(tabuleiro, jogadorAtual);
        } 
        else {
            //jogada computador
            fazerJogadaComputador(tabuleiro, jogadorAtual);
        }
        
        let estado = verificarEstado(tabuleiro, jogador1, jogador2);

        if (estado !== 'Em andamento') {
            mostrarTabuleiro(tabuleiro);
            console.log(estado);

            // Atualizar pontuação dos jogadores
            if (estado.includes("venceu")) {
                if (estado.includes(jogador1.nome)) {
                    pontuacoes[jogador1.nome] = (pontuacoes[jogador1.nome] || 0) + 1;
                } else if (estado.includes(jogador2.nome)) {
                    pontuacoes[jogador2.nome] = (pontuacoes[jogador2.nome] || 0) + 1;
                }
                salvarPontuacoes(pontuacoes);
            }
            break;
        }                      
        // Alternância entre jogador1 e jogador2
        jogadorAtual = (jogadorAtual === jogador1) ? jogador2 : jogador1;       
    }

    exibirMenu(); // Chamada para exibir o menu após o término do jogo
}

// Função para realizar uma jogada contra o computador (aleatória)
function fazerJogadaComputador(tabuleiro, jogadorAtual) {
    while (true) {
        let linha = Math.floor(Math.random() * 3);
        let coluna = Math.floor(Math.random() * 3);

        if (tabuleiro[linha][coluna] === ' ') {
            tabuleiro[linha][coluna] = jogadorAtual.caracter;
            break;
        }
    }    
}

// Função para realizar uma jogada
function fazerJogada(tabuleiro, jogadorAtual) {
    while (true) {
        mostrarTabuleiro(tabuleiro);
        let linha = parseInt(prompt(jogadorAtual.nome  + ", escolha a linha (0, 1 ou 2):"));
        let coluna = parseInt(prompt(jogadorAtual.nome  + ", escolha a coluna (0, 1 ou 2):"));

        if (isNaN(linha) || isNaN(coluna) || linha < 0 || linha >= 3 || coluna < 0 || coluna >= 3 || tabuleiro[linha][coluna] !== ' ') {
            console.log('\nJogada inválida. Tente novamente.');
        } else {
            tabuleiro[linha][coluna] = jogadorAtual.caracter;
            break;
        }
    }    
}
// Função para verificar o estado do jogo (vitória, empate ou jogo em andamento)
function verificarEstado(tabuleiro, jogador1, jogador2) {
    // Verificar linhas e colunas
    for (let i = 0; i < 3; i++) {
        if (
            (tabuleiro[i][0] !== ' ' && tabuleiro[i][0] === tabuleiro[i][1] && tabuleiro[i][1] === tabuleiro[i][2]) ||
            (tabuleiro[0][i] !== ' ' && tabuleiro[0][i] === tabuleiro[1][i] && tabuleiro[1][i] === tabuleiro[2][i])
        ) {
            return (tabuleiro[i][0] === jogador1.caracter) ? jogador1.nome + " venceu!" : jogador2.nome + " venceu!";
        }
    }

    // Verificar diagonais
    if (
        (tabuleiro[0][0] !== ' ' && tabuleiro[0][0] === tabuleiro[1][1] && tabuleiro[1][1] === tabuleiro[2][2]) ||
        (tabuleiro[0][2] !== ' ' && tabuleiro[0][2] === tabuleiro[1][1] && tabuleiro[1][1] === tabuleiro[2][0])
    ) {
        return (tabuleiro[1][1] === jogador1.caracter) ? jogador1.nome + " venceu!" : jogador2.nome + " venceu!";
    }

    // Verificar empate
    if (verificarEmpate(tabuleiro)) {
        return 'Jogo empatado!';
    }

    // Jogo em andamento
    return 'Em andamento';
}

// Função para verificar empate
function verificarEmpate(tabuleiro) {
    for (let i = 0; i < tabuleiro.length; i++) {
        for (let j = 0; j < tabuleiro[i].length; j++) {
            if (tabuleiro[i][j] === ' ') {
                return false; // Ainda há espaços vazios, o jogo não é um empate
            }
        }
    }
    // Todos os espaços estão preenchidos, o jogo é um empate
    return true; 
}

// Iniciar o jogo
exibirMenu();


