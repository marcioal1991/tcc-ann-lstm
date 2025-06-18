
# Predição Pluviométrica com LSTM usando TensorFlow e Node.js

Este projeto implementa uma Rede Neural Artificial do tipo LSTM para previsão de precipitação no estado do Rio Grande do Sul, utilizando dados históricos do INMET. O sistema foi desenvolvido em Node.js com TensorFlow (suporte à GPU) e armazena os dados em MongoDB. Além disso, permite o acompanhamento dos treinamentos via TensorBoard.

---

## Tecnologias utilizadas

- Node.js
- TensorFlow com suporte à GPU (`@tensorflow/tfjs-node-gpu`)
- MongoDB
- Docker e Docker Compose
- TensorBoard
- CSV Parser
- Date-fns

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
- GPU compatível com CUDA (opcional, mas recomendado para TensorFlow GPU)

Importante: Caso você não possua uma GPU ou não tenha os drivers da NVIDIA instalados, é possível executar o projeto no modo CPU. Veja as instruções na seção "Execução sem GPU (modo CPU)".

---

## Instalação

### Clonar o repositório

```bash
git clone https://github.com/marcioal1991/tcc-ann-lstm.git
cd tcc-ann-lstm
```

### Instalar as dependências

```bash
npm install
```

---

## Execução com Docker

### Levantar os containers

```bash
docker-compose up -d
```

Este comando sobe os seguintes serviços:

- MongoDB (para armazenamento dos dados)
- TensorBoard (para visualização dos treinamentos)
- Node.js executando o projeto (com suporte à GPU, se configurado)

Atenção: Verifique se os drivers da GPU e os runtimes NVIDIA estão corretamente instalados no seu sistema para que o TensorFlow GPU funcione dentro do Docker.

---

## Execução sem GPU (modo CPU)

Caso não possua GPU ou não tenha os drivers NVIDIA instalados, é possível rodar o projeto utilizando apenas a CPU.

### Opção 1 – Ajustando o Docker

No arquivo `docker-compose.yml`, remova ou comente qualquer linha relacionada ao uso da GPU, como:

```yaml
runtime: nvidia
```

---

## Configuração

O projeto possui um arquivo `.env.example` que pode ser utilizado como base. Copie-o e renomeie para `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Edite as variáveis conforme sua necessidade, principalmente a conexão com o MongoDB e diretórios de logs:

```env
MONGO_URI=mongodb://localhost:27017/seu_banco
TENSORBOARD_LOGDIR=./logs
```

---

## Acesso ao TensorBoard

Após o treinamento, o TensorBoard estará disponível em:

```
http://localhost:6006
```

---

## Ordem de execução dos comandos

Após subir os containers, é necessário acessar o container do Node.js para executar os comandos:

```bash
docker exec -it node bash
```

Dentro do container, execute os seguintes comandos na ordem abaixo:

```bash
node csv-parser
node importer
node transform
node normalizer
node ann-train
node ann-predict
```

Esta é a sequência correta para:

1. Processar os arquivos CSV.
2. Importar os dados para o MongoDB.
3. Estruturar os dados em janelas temporais.
4. Normalizar os dados.
5. Realizar o treinamento da Rede Neural LSTM.
6. Gerar as previsões.

---

## Observações importantes

- O repositório já contém os diretórios `models` e `logs` com modelos treinados e registros anteriores para visualização no TensorBoard.
- Caso queira executar novamente todo o processo de treinamento, basta seguir novamente a ordem dos comandos descrita acima.
- Se desejar limpar os modelos e os logs, basta remover os diretórios `models` e `logs` antes de reexecutar os comandos.

---

## Estrutura de dados esperada

- Dados meteorológicos no formato CSV, obtidos no site do [INMET](https://bdmep.inmet.gov.br/).
- Organizados por estação e por séries temporais.
- O processo de normalização e estruturação está documentado no código.

---

## Funcionalidades principais

- Processamento de dados meteorológicos históricos.
- Treinamento de modelo LSTM com TensorFlow.
- Avaliação da performance com e sem ponderação das variáveis.
- Geração de previsões e comparação com dados reais.
- Visualização dos logs de treinamento no TensorBoard.

---

## Licença

Este projeto está licenciado sob a licença MIT.

---

## Autor

Marcio Almeida de Lima – [GitHub](https://github.com/marcioal1991) – marcio.almeida@ufn.edu.br