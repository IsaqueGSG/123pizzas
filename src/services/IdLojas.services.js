// ./services/idLojas.services.jsx

import chavaoImg from '../assets/chavaopizzas.jpg';

const Lojas = [
    {
        idLoja: "demo",
        img: "https://tse1.mm.bing.net/th/id/OIP.gVvi9ineTYCQmNLDmItrXQHaE6?rs=1&pid=ImgDetMain&o=7&rm=3",
        nome: "Demosntração",
        descricao: "Loja de demonstração para testes"
    },
    {
        idLoja: "chavao",
        img: chavaoImg,
        nome: "Familia Chavão",
        descricao: "Pizzaria"
    },
    {
        idLoja: "chavaoMix",
        img: chavaoImg,
        nome: "Familia Chavão Mix",
        descricao: "Padaria e restaurante"
    },
    {
        idLoja: "acaisena",
        img: "https://frootiva.com.br/wp-content/uploads/2022/04/acai.jpg",
        nome: "Açai Sena",
        descricao: "Açai da melhor qualidade"
    },
];

export default Lojas;
