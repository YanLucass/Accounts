// Modulos externos
import inquirer from "inquirer";
import chalk from "chalk";

// Core Modules
import fs, { writeFileSync } from 'fs';

function operation() {
    inquirer.prompt([{
        type: 'list', //tipo lista
        name: 'action', // nome para pergunta, pare referenciar ela dps 
        message: 'O que você deseja fazer?',
        choices: [   //choices usado par acriar um array que vai ter todas as opções que pode realizar algo no sistema.
            'Criar conta',
            'Consultar saldo',
            'Depositar',
            'Sacar',
            'Transferir',
            'Sair',
            'Deletar conta'
        ] 
    },
    // solução para alguma opção escolhida
])
    .then((response => {
      
        const action = response['action'] // Teremos uma dessas opções da chave action nesse array de resposta enviado

        if(action === 'Criar conta')  {
            createAccount();
    
        }else if(action === 'Depositar') {
            deposit();

        } else if(action === 'Consultar saldo') {   
            getAccountBalence();

        } else if(action === 'Sacar') {
            withDraw();

        } 
        else if(action === 'Transferir') {
            transfer();
        } 
        else if(action === 'Deletar conta') {
            closeAccount();   
        }
        
        else if(action === 'Sair') {
            console.log(chalk.bgBlue.black('Obrigado por usar o accounts!'));
            process.exit() // termina o programa.
        }

    }))
    .catch(err => console.log(err));
}

operation();

//create account 

function createAccount() {
    console.log(chalk.bgGreen.black('Parabéns por escolher nosso banco!'));
    console.log(chalk.green('Defina as opções da sua conta a seguir'));
    // chamando construção da conta
    buildAccount();
}

// buildAccount

function buildAccount() {

    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite o nome da conta:'
        } 
    ])
    .then(response => {

        const accountName = response['accountName'];
        console.info(accountName);

        // "criação do bd"

        if(!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts');
        }

         // verificando se a conta ja existe. Salvos em formato de json
        if(fs.existsSync(`accounts/${accountName}.json`)) { 
            console.log(chalk.bgRed.black('Esta conta já existe, escolha outra.'));

            buildAccount() // chamando para criar dnv
            return
        }

        fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', (err) => console.log(err));
        console.log(chalk.green('Parabéns a sua conta foi criada!.'))
        operation()
    })
    .catch(err => console.log(err));
}

// add an amount to user account

function deposit() {

    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual é o nome da sua conta'
        }
    ])
    .then(response => {

        const accountName = response['accountName'];

        // verify if accounts exists
        if(!checkAccounts(accountName)) {
            return deposit(); // volta para função deposit
        };

        // account exists
        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você quer depositar? '
            },
         ])
        .then(response => {
            const amount = response['amount'];

            // add an amount
            addAmount(accountName, amount);

            // back to operation
            operation();

      })
        .catch(err => console.log(err));

    })
        .catch(err => console.log(err));
}

// verify if accounts exists function 

function checkAccounts(accountName) {
    
    if(!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Essa conta não existe, tente novamente.'));
        return false;
    }

    return true;
}

// addAmount function 
function addAmount(accountName, amount) {
    const accountData = getAccount(accountName)  // pegando o retorno de getAccount e jogando em accountData

    // verificar se o deposito foi enviado em branco
    if(!amount){
        console.log(chalk.bgRed.black('Ocorreu um erro tente novamente mais tarde!'));
        return deposit();
    } 

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance) // Colocando em float os valores pq vem em string

    // escrever novo valor e transformar em texto de novo o objeto json
    fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), function(err) {
        console.log(err);
    },
);

    console.log(chalk.green(`Foi depositado um valor de $${amount} na sua conta!`));  
}

// read file function
function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r' // apenas para ler
    })

    return JSON.parse(accountJSON) // transformando em obj de novo, la no arquivo tá em texto. Vai retornar o balance, que é oq tem nesse obj ne.
}

// função para pegar o saldo da cotna

function getAccountBalence() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual é o nome da sua conta?'
        },
    ])
    .then((response) => {
        
        const accountName = response['accountName'];

        // verify if account exists

        if(!checkAccounts(accountName)) {
            return getAccountBalence() // para ele poder falar de novo o nome
        }

        // se existir pegue os dados dela
        const accountData = getAccount(accountName);

        console.log(chalk.bgBlue.black(`O saldo da sua conta em RS é ${accountData.balance}`))
        operation()
    })
    .catch(err => console.log(err));

}

// withdraw an amount from users accounts 
function withDraw() {

    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite o nome da conta'
        }
    ])
    .then((response => {

        const accountName = response['accountName'];

        if(!checkAccounts(accountName)) {
            return withDraw();
        }

        inquirer.prompt([
            {
                name: 'amountDraw',
                message: 'Quanto deseja remover?'
            }
        ])
        .then((response) => {
            
            const amount = response['amountDraw'];
            
            // remove amount function 
            removeAmount(accountName, amount)
        })

        .catch(err => console.log(err));

    }))
        .catch(err => console.log(err));

}


// função para remover o dinheiro

function removeAmount(accountName, amount) {

    const accountData = getAccount(accountName);

    if(!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente de novo!'))
        return withDraw();
    }

    if(accountData.balance < amount) {
        console.log(chalk.bgRed.black('Valor indisponivel!'));
        return withDraw();
    
    }   
    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

    fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), err => console.log(err));
    console.log(chalk.green(`Foi realizado um saque de R$${amount} em sua conta!`));
    operation();
}

// função transferencia de dinheiro entre contas

function transfer() {

    inquirer.prompt([
        {
             name: 'accountName',
             message: ' Qual é o nome da sua conta? '
        },

        {
            name: 'peopleAccount',
            message: 'Para qual conta você quer transferir?'
        }
    ])
    .then((response) => {

        const accountName = response['accountName']
        const peopleAccount = response['peopleAccount'];

        // conta existe?
        if(!checkAccounts(accountName)) {
            return transfer();
        }

        // conta destino existe?
        if(!checkAccounts(peopleAccount)) {
            return transfer()
        }

        depositTransfer(accountName, peopleAccount); 

    })
    .catch(err => console.log(err));    
}

// transferir function 
function depositTransfer(accountName, peopleAccount) {

    inquirer.prompt([
        {
            name: 'amount',
            message: 'Quanto você quer tranferir? '
        }
    ])
    .then((response => {

        const amount = response['amount'];
        const accountData = getAccount(accountName);
        const peopleAccountData = getAccount(peopleAccount);

        // caso a conta atual não tenha dinehiro para transferir
        if(accountData.balance < amount) {
            console.log(chalk.bgRed.black('Valor indisponivel!'));
            return transfer()
        }

        accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);
        peopleAccountData.balance = parseFloat(peopleAccountData.balance) + parseFloat(amount);

        // alterando os valores nas contas
        fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), err => console.log(err));
        fs.writeFileSync(`accounts/${peopleAccount}.json`, JSON.stringify(peopleAccountData), err=> console.log(err))
        console.log(chalk.green(`Transferencia de RS${amount} com sucesso`));

        // volta para operation
        operation()

    }))
    .catch(err => console.log(err));
}

// Função para encerrar a conta 

function closeAccount() {
    
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual conta você quer deletar? '
        }
    ])
    .then((response => {

        const accountName = response['accountName'];
       
        // entrada nula
        if(!accountName) {
            console.log(chalk.bgRed.black('Digite uma conta!'))
            return closeAccount();
        }

        if(!checkAccounts(accountName)) {
            return operation()
        }

        deleteAccount(accountName);
    }))
    .catch(err => console.log(err));
}

function deleteAccount(accountName) {
    
    const accountData = getAccount(accountName);

    if(accountData.balance > 0) {
        console.log(chalk.bgYellow.black(`Você ainda tem tem um saldo de RS$${accountData.balance} Saque ou transfira antes de encarrar a conta`));
        return operation();
    
    } 

    inquirer.prompt([
        {
            name: 'confirmation',
            type: 'confirm',
            message: 'Tem certeza de que deseja encerrar esta conta? (Ação irreversível)'
        }
    ])
    .then((response) => {

        const confirmation = response['confirmation'];


        if(!confirmation) {
            console.log(chalk.bgBlue('Processo de encerramento cancelado!'));
            return operation();
        }

        fs.unlinkSync(`accounts/${accountName}.json`, (err) => console.log(err));
        console.log(chalk.bgGreen.black(`Conta ${accountName} encerrada com sucesso`))
        operation();
    })
    .catch(err => console.log(err));
}