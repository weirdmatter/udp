# udp

## Requisitos

### Funcionais

| **Identificador**           	| RF001	|
|-------------------------	    |  ---	|
| **Requisito**               	|   Estabelecimento e encerramento de conexão |
| **Descritivo**              	|   A aplicação deve garantir que exista uma conexão ativa entre sender e host durante o momento do envio dos pacotes, e que esta conexão seja propriamente encerrada quando a transmissão de dados acabar.	|
| **Requisitos relacionados** 	|   	|

</br>

| **Identificador**           	| RF002 |
|-------------------------	    |  ---	 |
| **Requisito**               	| Sequenciamento de mensagens |
| **Descritivo**              	| A aplicação deve garantir que cada pacote enviado do sender para o host seja devidamente sequenciado. |
| **Requisitos relacionados** 	|   RNF001	 |

</br>

| **Identificador**           	| RF003 |
|-------------------------	    |  ---	 |
| **Requisito**               	| Controle de erro |
| **Descritivo**              	| A aplicação deve garantir que os pacotes transitados entre sender e host stejam íntegros, através de um cálculo de CRC que deve ser verificado em ambas as pontas da comunicação. |
| **Requisitos relacionados** 	|   RNF003	 |

</br>

| **Identificador**           	| RF004 |
|-------------------------	    |  ---	 |
| **Requisito**               	| Envio de arquivo |
| **Descritivo**              	| O sistema deve permitir que o usuário escolha um arquivo de seu computador para enviar ao destinatário. |
| **Requisitos relacionados** 	|   RNF004, RNF005	 |

</br>

| **Identificador**           	| RF005 |
|-------------------------	    |  ---	 |
| **Requisito**               	| Controle de congestionamento |
| **Descritivo**              	| O sistema deve ser capaz de lidar com erros na transmissão de pacotes, retransmitindo os pacotes problemáticos até certo ponto. Caso a resposta para a transmissão de um pacote não chegue dentro de um certo limite de tempo, ou receba uma mensagem duplicada 2 vezes seguidas, a retransmissão deste pacote deve ocorrer com Slow Start. Caso seja recebida uma resposta duplicada 3 vezes seguida, a conexão com o host deve ser encerrada e um aviso ao usuário sobre a falha exibido.
| **Requisitos relacionados** 	|   	 |

</br>

| **Identificador**           	| RF006 |
|-------------------------	    |  ---	 |
| **Requisito**               	| Exibir logs durante as ações |
| **Descritivo**              	| Durante o envio, a aplicação deve exibir na tela um log do que está acontecendo, tanto no lado da máquina origem, como na do destino.
| **Requisitos relacionados** 	|   	 |


</br>

### Não funcionais

| **Identificador**           	| RNF001 |
|-------------------------	    |  ---	 |
| **Requisito**               	|    Números de sequência de pacotes  	 |
| **Descritivo**              	|   Os números de sequência de pacotes começam em 0 e são incrementados de acordo com a quantidade de pacotes que está sendo transmitida.	 |
| **Requisitos relacionados** 	|   RNF002, RF002	 |


</br>


| **Identificador**           	| RNF002 |
|-------------------------	    |  ---	 |
| **Requisito**               	|    Número do ACK  	 |
| **Descritivo**              	|   O número do ACK é formado pelo número da sequência do pacote + 1. Ou seja, caso eu envie o pacote com número de sequência 92, o ACK referente a este pacote terá o valor de 93.	 |
| **Requisitos relacionados** 	|   RNF001, RF002	 |

</br>


| **Identificador**           	| RNF003 |
|-------------------------	    |  ---	 |
| **Requisito**               	|    Cálculo do CRC  	 |
| **Descritivo**              	|   O controle de erro deve ser realizado pela própria aplicação através de um calculo de CRC, cujo valor deve ser incluído no pacote durante o envio, e o lado receber deve calculá-lo novamente e conferir com a informação contida no pacote para confirmar que o pacote está integro. Ao receber um pacote correto, o receptor retorna um ACK com o número de sequência + 1. Caso o pacote está errado, o receptor o descarta.	 |
| **Requisitos relacionados** 	|   RF003	 |


</br>


| **Identificador**           	| RNF004 |
|-------------------------	    |  ---	 |
| **Requisito**               	|    Tamanho dos pacotes  	 |
| **Descritivo**              	|   Cada pacote enviado/recebido pelas partes deve conter **exatamente** 512 bytes. Caso seja necessário, é possível adicionar um *padding* para garantir que este tamanho seja atingido.	 |
| **Requisitos relacionados** 	|   RF004, RNF005	 |

</br>


| **Identificador**           	| RNF005 |
|-------------------------	    |  ---	 |
| **Requisito**               	|    Remontagem dos pacotes no destino  	 |
| **Descritivo**              	|    destino deve, conforme for recebendo os pacotes, remontá-los e salvá-los em um arquivo. Para conferir que o arquivo transmitido e o arquivo recebido são idênticos, o usuário deve executar o comando md5sum ou shasum em ambos os arquivos (original e remontado), e os hashes gerados precisam coincidir.	 |
| **Requisitos relacionados** 	|   RF004, RNF004	 |



<style>
    table{
        border-spacing: 0;
        border:2px solid;
    }
    
    th{
        border:2px solid;
    }
    
    td{
        border:2px solid;
    }

</style>