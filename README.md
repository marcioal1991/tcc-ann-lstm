# Predição Pluviométrica com LSTM usando TensorFlow e Node.js

Este projeto implementa uma Rede Neural Artificial do tipo LSTM para previsão de precipitação no estado do Rio Grande do Sul, utilizando dados históricos do INMET. O sistema foi desenvolvido em Node.js com TensorFlow (suporte a GPU) e armazena os dados em MongoDB. Além disso, permite o acompanhamento dos treinamentos via TensorBoard.

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

---

## Instalação

### 🔧 Clonar o repositório

```bash
git clone https://github.com/marcioal1991/tcc-ann-lstm.git
cd tcc-ann-lstm
```
### Instalar dependências
```bash
npm install
```
### Levantar os containers
```bash
docker-compose up -d
```
Este comando sobe:

MongoDB (para armazenamento dos dados)

TensorBoard (para visualização dos treinamentos)

O container do Node.js executando o projeto com suporte à GPU (se configurado)

⚠️ Importante: Verifique se o driver da GPU e os runtimes NVIDIA estão corretamente instalados no seu sistema para que o TensorFlow GPU funcione dentro do Docker.

## Funcionalidades principais
- Processamento de dados meteorológicos históricos.
- Treinamento de modelo LSTM com TensorFlow.
- Avaliação da performance com e sem ponderação das variáveis.
- Geração de previsões e comparação com dados reais.
- Visualização dos logs de treinamento no TensorBoard.

## Licença
Este projeto está licenciado sob a licença MIT - consulte o arquivo LICENSE para detalhes.

## Autor
Marcio Almeida de Lima – GitHub – marcio.almeida@ufn.edu.br

Empreendimentos - portal jetlar;
Definição de Projeto concluido;
node csv-parser
node importer
node transform
node normalizer
node ann-train
node ann-predict

