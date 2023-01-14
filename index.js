// modulos externos
import inquirer from "inquirer"
import chalk from "chalk"
// const chalk = require("chalk")

// modulos internos
import fs from "fs"
import { create } from "domain"

operation()

function operation() {
    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'o que você deseja fazer?',
        choices: [
            'Criar conta',
            'Consultar saldo',
            'Depositar',
            'Sacar',
            'Sair',
        ]
    }]).then((answer) => {
        const action = answer.action
        
        if (action === 'Criar conta') createAccount()
        else if (action === 'Consultar saldo') {
            getAccountBalance()
        }
        else if (action === 'Depositar') {
            deposit()
        }
        else if (action === 'Sacar') {
            withdraw()
        }
        else {
            console.log(chalk.bgBlue.black('Obrigado por utilizar o Accounts!'))
            process.exit()
        }
    })
    .catch((err) => {
        console.log(err)
    })
}
// withdraw an amount from user account
function withdraw() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta',

        }
    ]).then((answer) => {
        const accountName = answer.accountName

        if(!checkAccounts(accountName)) {
            return withdraw()
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Digite o valor a ser sacado'
            }
        ]).then((answer) => {
            const amount = answer.amount
            withdrawAmount(accountName, amount)
            
            operation()
        }).catch((err) => {
            console.log(err);
        })
    }).catch((err) => {
        console.log(err)
    })
}

// show account balance
function getAccountBalance() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Informe o nome da conta.'
        }
    ]).then((answer) => {
        const accountName = answer.accountName
        if(!checkAccounts(accountName)) {
            return getAccountBalance()
        }

        const accountData = getAccount(accountName)

        console.log(chalk.bgBlue.black(`Olá, o saldo da sua conta é de R$${accountData.balance}`))
        operation()
    }).catch((err) => {
        console.log(err)
    })
}

// add an amount to user account
function deposit() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta',

        }
    ]).then((answer) => {
        const accountName = answer.accountName

        if(!checkAccounts(accountName)) {
            return deposit()
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Digite o valor a ser depositado'
            }
        ]).then((answer) => {
            const amount = answer.amount
            addAmount(accountName, amount)
            
            operation()
        }).catch((err) => {
            console.log(err);
        })
    }).catch((err) => {
        console.log(err)
    })
}

function withdrawAmount(accountName, amount) {
    const account = getAccount(accountName)

    if(!amount) {
        console.log(chalk.bgRed.white('Ocorreu um erro, tente novamente mais tarde!'))
        return withdraw()
    }
    if (parseFloat(amount) > parseFloat(account.balance)) {
        console.log(chalk.bgRed.white('Saldo insuficiente'))
        return withdraw()
    }
    account.balance = parseFloat(account.balance) - parseFloat(amount)
    
    fs.writeFileSync(`accounts/${accountName}.json`,
        JSON.stringify(account),
        function (err) {
            console.log(err)
        }
    )

    console.log(chalk.bgGreen.white(`R$${amount} sacado da sua conta com sucesso!`));
}
function addAmount(accountName, amount) {
    const account = getAccount(accountName)

    if(!amount) {
        console.log(chalk.bgRed.white('Ocorreu um erro, tente novamente mais tarde!'))
        return deposit()
    }

    account.balance = parseFloat(account.balance) + parseFloat(amount)
    
    fs.writeFileSync(`accounts/${accountName}.json`,
        JSON.stringify(account),
        function (err) {
            console.log(err)
        }
    )

    console.log(chalk.bgGreen.white(`R$${amount} depositado na sua conta com sucesso!`));
}

function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf-8',
        flag: 'r',
    })

    return JSON.parse(accountJSON)
}

function checkAccounts(accountName) {
    if(!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Está conta não existe! Tente novamente'))
        return false
    }
    return true
}

function createAccount() {
    console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco!'))
    console.log(chalk.green('Defina as opções da sua conta a seguir'))
    buildAccount()
}

function buildAccount() {
    inquirer.prompt([
        {
            name: "accountName",
            message: "Digite um nome para a sua conta"
        }
    ]).then((answer) => {
        const accountName = answer.accountName
        console.info(accountName)

        if(!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts')
        }

        if(fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(chalk.bgRed.black('Está conta já existe'))
            buildAccount()
            return
        }

        fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', function(err){
            console.log(err)
        })

        console.log(chalk.green('Parabéns, sua conta foi criada'))
        operation()
    }).catch((err) => {
        console.log(err)
    })
}