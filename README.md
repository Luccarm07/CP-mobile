# 🍓🥛 Quem Comeu Meu Iogurte?

App de **geladeira compartilhada** para repúblicas, casas e escritórios, feito em **React Native (Expo)** com **Firebase Authentication** e **Cloud Firestore**.

CheckPoint 3 · Mobile Application Development · FIAP

| Nome | RM |
|---|---|
| Lucca Ramos Mussumecci | RM562027 |

---

## 1. Proposta do app

### O problema

Quem já morou em república ou usou a copa de um escritório conhece a cena: você abre a geladeira e o seu iogurte sumiu. Ninguém viu nada, ninguém assume, e a discussão vira grupo de WhatsApp. Também é comum comida estragar no fundo da prateleira porque ninguém lembra de quem é nem quando vence.

### A solução

Um app onde cada pessoa **registra o que guardou** (com validade), todo mundo **vê a geladeira em tempo real**, e quem comer algo que não é seu tem um caminho honesto: **confessar pelo app**. O dono do item decide se **perdoa** ou **cobra**, e as confissões da semana vão para o **Mural da Vergonha** 🏆.

### Perfis

Não existe cadastro de "admin" pelo Console: os papéis são definidos **dentro do próprio app**.

| Papel | Quem é | O que pode fazer |
|---|---|---|
| **Admin da geladeira** | Quem criou a geladeira | Tudo de um membro, mais: remover membros, jogar fora qualquer item (faxina) e excluir a geladeira |
| **Membro** | Quem entrou com o código de convite | Guardar, editar e tirar os próprios itens; avisar que um item sumiu; confessar; julgar confissões sobre os próprios itens; ver e enviar o código de convite; sair da geladeira |

Uma pessoa pode participar de várias geladeiras (casa + trabalho, por exemplo) e ser admin de umas e membro de outras.

### Fluxos

**Conta (Firebase Authentication)**
1. Cadastro com nome, e-mail, senha e confirmação. Um e-mail de verificação é enviado na hora.
2. Login com e-mail e senha.
3. "Esqueci minha senha", em tela própria, com envio do link de redefinição.
4. Lembrete para confirmar o e-mail, com botões "Reenviar" e "Já confirmei".
5. Sessão salva no aparelho: ao reabrir o app, o usuário continua logado.
6. Logout com confirmação.

**Geladeiras**
1. **Criar:** dá um nome e recebe um **código de convite** de 6 caracteres (sem 0/O e 1/I, para ninguém confundir ao ditar).
2. **Convidar:** enquanto só você está na geladeira, ela mostra o código e um botão "Convidar pessoas". Na tela de membros dá para copiar ou enviar o código (WhatsApp, por exemplo).
3. **Entrar** com um código recebido.
4. **Membros:** lista em tempo real; o admin pode remover pessoas.
5. **Sair** (membro) ou **excluir a geladeira inteira** (admin).

**Itens**
1. **Guardar** um item: nome, categoria (🥛🍱🍫🥤🍎🧀), validade (com atalhos "Hoje", "Amanhã", "+3 dias" e "+1 semana") e um recado opcional ("NÃO MEXA 😤").
2. **Lista em tempo real** com filtros: *Na geladeira*, *Meus*, *Vencendo* e *Casos*. Cada item mostra quanto falta para vencer.
3. **Editar** ou **tirar da geladeira** (só o dono; o admin também pode jogar fora qualquer item).
4. **"Sumiu!":** o dono avisa que o item desapareceu e ninguém assumiu. Vira um mistério 🕵️.
5. **Confessar:** outra pessoa admite que comeu (pode deixar um recado: "amanhã compro outro 🙏").
6. **Veredito:** o dono **perdoa** 😇 ou **cobra** 💸. O app avisa o dono quando há confissões esperando por ele.

**Mural da Vergonha**
- Ranking semanal de quem mais confessou, com títulos ("👑 Rato de Geladeira", "🥈 Boca Nervosa"...), quantos casos foram perdoados ou cobrados, número de mistérios abertos e a categoria mais atacada. Dá para navegar pelas semanas anteriores.

### Ciclo de vida de um item

```
[na_geladeira] ──(dono: "Sumiu!")──► [sumiu]
      │                                 │
      └────(outra pessoa confessa)──────┤
                                        ▼
                                  [confessado]
                                        │ (o dono decide)
                               ┌────────┴────────┐
                          [perdoado] 😇      [cobrado] 💸

Enquanto está em [na_geladeira] ou [sumiu], o dono pode tirar o item da lista.
```

### Regras de negócio

- Só **membros** veem a geladeira e os itens dela.
- Só o **dono do item** edita, avisa sumiço, apaga e dá o veredito. A exceção é o **admin**, que pode jogar fora qualquer item (faxina).
- **Ninguém confessa pelo outro:** o culpado gravado é sempre quem está logado.
- Depois de confessado, o item **não pode ser apagado pelo dono**, para o caso não "sumir" do Mural (só o admin, na faxina).
- O **admin** não pode sair (só excluir a geladeira) e não pode ser removido.
- Máximo de **30 membros** por geladeira.
- O Mural usa a **semana ISO** (segunda a domingo) gravada no momento da confissão.

Todas essas regras são garantidas no **servidor**, pelas regras do Firestore (veja a seção 3), e não só escondendo botões na tela.

### Cenários de erro e sucesso tratados

| Situação | O que o app faz |
|---|---|
| Campo vazio, e-mail inválido, senha curta, senhas diferentes | Mensagem embaixo do campo, sem chamar o Firebase |
| E-mail ou senha incorretos | "E-mail ou senha incorretos." |
| E-mail já cadastrado | "Já existe uma conta com este e-mail. Tente entrar ou recuperar a senha." |
| Muitas tentativas de login | Pede para aguardar alguns minutos |
| Sem internet no login/cadastro | "Sem conexão com a internet..." |
| Recuperação de senha enviada | Confirmação na tela (sem revelar se o e-mail existe) |
| Nome da geladeira vazio ou longo demais | Mensagem embaixo do campo |
| Código de convite com formato errado | Mensagem embaixo do campo |
| Código que não existe | "Código não encontrado. Confira com quem te convidou." |
| Já é membro da geladeira do código | Abre a geladeira e avisa |
| Geladeira lotada ou excluída | Mensagem explicando |
| Código sorteado já existe | Sorteia outro automaticamente (até 5 tentativas) |
| Data de validade inexistente (31/02) | "Data inválida. Use DD/MM/AAAA." |
| Data já passada | Aviso (permite, pode ser de propósito) |
| Item excluído enquanto alguém está com ele aberto | "Este item não existe mais" + Voltar |
| Tentar editar item que já foi confessado | "Não dá para editar" |
| Membro removido ou geladeira excluída com o app aberto | Tela "Geladeira indisponível" + Voltar |
| Escrita sem internet | O item aparece na hora com "⏳ sincronizando"; se o servidor não responder em 12 s, avisa que será enviado quando a conexão voltar |
| Falha ao carregar listas | Tela de erro com "Tentar de novo" |
| Listas vazias (sem geladeiras, sem itens, semana sem confissões) | Estado vazio com explicação |
| Ações destrutivas (sair, excluir, remover, logout) | Pedem confirmação |
| Cliques repetidos | Botão mostra "carregando" e ignora toques extras |
| Sucessos | Confirmação na tela (confissão registrada, veredito, caso aberto, link de senha enviado, código copiado...) |

---

## 2. Como rodar

### Pré-requisitos

- **Node.js 20 ou superior** ([nodejs.org](https://nodejs.org), versão LTS)
- App **Expo Go** no celular (Play Store / App Store), ou emulador Android
- Conta gratuita no **Expo** ([expo.dev/signup](https://expo.dev/signup)): o Expo Go exige login para abrir projetos

### Instalar e iniciar

O projeto já vem ligado ao Firebase do projeto: a configuração está em [`src/config/firebase.ts`](src/config/firebase.ts) e as regras já estão publicadas. **Não é preciso configurar nada no Firebase.**

```bash
npm install
npx expo login     # entre com a sua conta Expo (a mesma do Expo Go no celular)
npx expo start
```

Depois:

- **Celular:** com o celular **no mesmo Wi-Fi** do computador, leia o QR Code (Android: botão *Scan QR code* do Expo Go; iPhone: app Câmera). O projeto também aparece em *Development servers* no Expo Go.
- **Emulador Android:** com o emulador aberto, aperte **`a`** no terminal.

Por fim, **crie uma conta pelo próprio app** (tela "Criar conta"). Para testar a confissão, use uma segunda conta: em outro aparelho ou saindo e entrando de novo (🙂 → Sair da conta).

> **A confirmação de e-mail não bloqueia o uso do app.** Ela só mostra um lembrete com os botões "Reenviar" e "Já confirmei". Dá para testar com qualquer e-mail, inclusive um inventado.

#### Se algo der errado

| Problema | Solução |
|---|---|
| Expo Go: *"You need to be signed in..."* | Rode `npx expo login` no computador com a mesma conta logada no Expo Go e reinicie o `npx expo start` |
| O celular não conecta ao QR Code | Confira se está no mesmo Wi-Fi; senão, use `npx expo start --tunnel` |
| Windows: *"a execução de scripts foi desabilitada"* | Rode `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` no PowerShell (ou use o Prompt de Comando) |
| App desatualizado depois de mudar o código | Aperte **`r`** no terminal para recarregar |
| Botão de ferramentas do Expo Go cobrindo a tela | Expo Go → menu de ferramentas → desligue **Tools button** (o menu volta ao chacoalhar o celular) |

### Usar outro projeto Firebase (opcional)

1. Crie um projeto no [Console do Firebase](https://console.firebase.google.com).
2. **Segurança > Authentication > Método de login:** ative **E-mail/senha**.
3. **Bancos de dados > Firestore:** crie o banco `(default)` em modo produção.
4. **Firestore > Regras:** cole o conteúdo de [`firestore.rules`](firestore.rules) e clique em **Publicar**.
5. **Visão geral > Adicionar app > Web:** copie o `firebaseConfig` para [`src/config/firebase.ts`](src/config/firebase.ts).

> Nenhum índice composto é necessário: todas as consultas usam um único filtro.

### Testes e verificação de tipos

```bash
npm test           # 38 testes unitários (Jest + jest-expo)
npm run typecheck  # TypeScript sem erros
```

| Arquivo | O que garante |
|---|---|
| `dates.test.ts` | Leitura/máscara de DD/MM/AAAA, datas inexistentes, ano bissexto, semana ISO na virada do ano |
| `expiry.test.ts` | Níveis "vencido / vence hoje / vencendo / ok" e os textos |
| `validation.test.ts` | Todos os formulários (login, cadastro, geladeira, convite, item) |
| `itemRules.test.ts` | Quem pode editar, apagar, confessar e julgar (espelho das regras do Firestore) |
| `ranking.test.ts` | Mural da Vergonha: contagem por semana, ordenação, mistérios, categoria mais atacada |
| `errors.test.ts` | Tradução de erros do Firebase, `withTimeout` (sem internet) e gerador de códigos |
| `fridgeService.test.ts` | Entrar com código (inexistente, já membro, lotada), colisão de códigos, sair/remover (Firestore *mockado*) |

### Roteiro para testar o fluxo completo

Use dois aparelhos/emuladores, ou saia e entre com outra conta.

1. **Ana** cria uma conta → cria a geladeira "Rep. Toca do Tatu" → copia o código.
2. **Beto** cria uma conta → "Tenho código" → entra na geladeira.
3. Ana guarda "Iogurte de morango" com validade amanhã → aparece **na hora** no celular do Beto.
4. Beto abre o iogurte → "Comi! Quero confessar" → deixa um recado.
5. Ana vê o aviso "Alguém confessou sobre item seu!" → abre → **Cobrar** 💸.
6. Os dois abrem o 🏆 **Mural da Vergonha**: Beto é o "👑 Rato de Geladeira".
7. Ana guarda um chocolate e marca **"Sumiu!"** → o mural mostra 1 mistério aberto.
8. Ana (admin) remove o Beto em 👥 → a geladeira some da lista do Beto (se ele estiver com ela aberta, aparece "Geladeira indisponível").

---

## 3. Conceitos utilizados

### Estrutura do projeto

```
app/                                 Telas (expo-router: cada arquivo é uma rota)
  _layout.tsx                        SafeAreaProvider + AuthProvider
  index.tsx                          Decide entre login e área logada
  (auth)/                            login, cadastro, esqueci-senha (só para deslogados)
  (app)/                             Área logada (só para logados)
    index.tsx                        Minhas geladeiras (tempo real)
    nova-geladeira.tsx, entrar.tsx   Modais de criar/entrar
    perfil.tsx                       Dados da conta, verificação de e-mail, logout
    geladeira/[fridgeId]/            Rota dinâmica: uma geladeira
      _layout.tsx                    FridgeProvider + "portão" de acesso + Stack interno
      index.tsx                      Itens com filtros
      item-form.tsx                  Guardar/editar item
      item/[itemId].tsx              Detalhes, confissão e veredito
      mural.tsx                      Mural da Vergonha
      membros.tsx                    Código de convite e membros
src/
  config/firebase.ts                 Configuração e inicialização do Firebase
  contexts/                          AuthContext e FridgeContext
  hooks/                             useRealtime (onSnapshot) e useAction (ações com loading/erro)
  services/                          Única camada que fala com o Firebase
  components/                        Button, TextField, Chip, ItemCard, Screen, estados...
  utils/                             Datas, validade, validação, erros, ranking, permissões
  theme/                             Cores, espaçamentos e tipografia
firestore.rules                      Regras de segurança
__tests__/                           Testes unitários
```

Fluxo das dependências: **tela → hook/contexto → service → Firebase**. As telas nunca importam o Firebase diretamente.

### Firebase Authentication — [`authService.ts`](src/services/authService.ts)

| Função | Uso no app |
|---|---|
| `createUserWithEmailAndPassword` | Cadastro |
| `updateProfile` | Salva o nome no `displayName` da conta (por isso não foi preciso criar uma coleção `users`) |
| `sendEmailVerification` | E-mail de confirmação no cadastro e no botão "Reenviar" |
| `signInWithEmailAndPassword` | Login |
| `sendPasswordResetEmail` | "Esqueci minha senha" |
| `user.reload()` | "Já confirmei": busca no servidor se o e-mail foi verificado |
| `signOut` | Logout |
| `onAuthStateChanged` | No [`AuthContext`](src/contexts/AuthContext.tsx): avisa o app inteiro quando alguém entra ou sai |
| `initializeAuth` + `getReactNativePersistence(AsyncStorage)` | Em [`firebase.ts`](src/config/firebase.ts): mantém a sessão salva no aparelho |

**Configuração no código, de propósito:** o `firebaseConfig` fica em [`firebase.ts`](src/config/firebase.ts) para quem baixar o repositório conseguir rodar direto. Esses dados não são secretos: eles só identificam o projeto e vão dentro de qualquer app publicado. A segurança vem das **regras do Firestore**, que exigem login e checam as permissões de cada documento (veja abaixo).

### Navegação protegida (expo-router)

- **Rotas por arquivo** e **rotas dinâmicas**: `geladeira/[fridgeId]` e `item/[itemId]`, lidas com `useLocalSearchParams`.
- **Grupos** `(auth)` e `(app)`: os `_layout.tsx` usam `<Redirect>` para impedir que um usuário deslogado veja a área logada, e vice-versa.
- **Stacks aninhados**: a geladeira tem o próprio `Stack` (itens, detalhes, mural, membros), dentro do `Stack` da área logada. `unstable_settings.initialRouteName` garante que a lista de itens seja sempre a base dessa pilha.
- **Modais** (`presentation: "modal"`) para criar geladeira, entrar com código e guardar item.
- `router.push`, `router.replace` (troca o modal pela geladeira criada), `router.back`.
- Opções de cabeçalho dinâmicas com `<Stack.Screen options={...} />` dentro da tela (título = nome da geladeira, botões 🏆 e 👥).

### Cloud Firestore

**Modelo de dados**

| Caminho | Conteúdo |
|---|---|
| `fridges/{fridgeId}` | `name`, `inviteCode`, `ownerId`, `memberIds` (array), `members` (mapa uid → nome), `joinProof`, `createdAt` |
| `fridges/{fridgeId}/items/{itemId}` | **Subcoleção**: `name`, `category`, `expiresOn`, `note`, `ownerId`, `ownerName`, `status`, dados da confissão |
| `inviteCodes/{CODIGO}` | `{ fridgeId }`: o próprio código é o ID do documento |

**Conceitos usados**

- **Tempo real com `onSnapshot`:** a lista de geladeiras, a geladeira aberta e os itens se atualizam sozinhos em todos os aparelhos. O hook genérico [`useRealtime`](src/hooks/useRealtime.ts) cuida de carregando/erro/dados e **cancela a escuta** (`unsubscribe`) ao sair da tela.
- **`includeMetadataChanges` + `hasPendingWrites`:** mostra "⏳ sincronizando" nos itens gravados sem internet, até o servidor confirmar.
- **`serverTimestamps: "estimate"`:** enquanto o horário do servidor não chega, mostra uma estimativa local em vez de `null`.
- **Consulta `array-contains`:** `where("memberIds", "array-contains", uid)` busca "as geladeiras das quais faço parte".
- **Subcoleções:** os itens ficam dentro da geladeira (`fridges/{id}/items`), o que facilita as regras de acesso.
- **Transação (`runTransaction`):** ao criar a geladeira, lê `inviteCodes/{codigo}` e só grava se o código estiver livre. Assim, dois grupos nunca ficam com o mesmo código, mesmo se forem criados no mesmo instante.
- **Escrita em lote (`writeBatch`):** excluir a geladeira apaga os itens em lotes de 400 (o limite é 500 operações) e depois o código e a geladeira. O Firestore **não apaga subcoleções sozinho**.
- **Operadores atômicos:** `arrayUnion` / `arrayRemove` para entrar e sair, `deleteField()` para tirar o nome do mapa, e caminhos com ponto (`"members.uid"`) para alterar só uma chave do mapa.
- **CRUD completo:** `addDoc`, `getDoc`, `getDocs`, `updateDoc`, `deleteDoc`, `onSnapshot`.
- **`serverTimestamp()`:** datas de criação e confissão vêm do servidor, então ninguém "volta no tempo" trocando o relógio do celular.

### Regras de segurança — [`firestore.rules`](firestore.rules)

As regras são o que de fato protege os dados, já que qualquer pessoa poderia chamar a API do Firestore sem passar pelo app.

- **Leitura:** só membros leem a geladeira (`uid in memberIds`) e os itens (`get()` na geladeira para checar).
- **Códigos:** qualquer usuário logado pode consultar **um** código (`get`), mas **não listar** todos (`list: false`).
- **Criar geladeira:** `ownerId` e `memberIds` têm de ser o próprio usuário. Com `getAfter()`, a regra confere que o código e a geladeira foram criados juntos e apontam um para o outro.
- **Entrar com código:** só é permitido **adicionar a si mesmo**, e o usuário precisa gravar em `joinProof.{uid}` exatamente o `inviteCode` da geladeira. Isso prova que ele conhecia o código, e não só o ID da geladeira. O limite de 30 membros também é checado aqui.
- **Sair/remover:** exatamente uma pessoa sai por vez. O próprio membro pode sair; só o admin remove outros; o admin nunca é removido. `memberIds` e `members` precisam continuar consistentes.
- **Itens:** `diff().affectedKeys().hasOnly([...])` limita **quais campos** cada ação pode mudar:
  - o dono edita só nome, categoria, validade e recado, e só enquanto o item está na geladeira;
  - quem confessa só mexe nos campos da confissão, e `culpritId` tem de ser ele mesmo;
  - o veredito só aceita `perdoado` ou `cobrado`, e só a partir de `confessado`.
- **Validação de dados no servidor:** tamanhos máximos, categoria dentro da lista, data no formato `AAAA-MM-DD` (regex), `createdAt == request.time`.

O arquivo [`itemRules.ts`](src/utils/itemRules.ts) espelha essas regras no app para mostrar só os botões permitidos. Ele tem testes próprios.

### React: hooks, contexto e componentes

- **`useState`:** formulários, erros por campo, filtro selecionado, semana do mural, modo "confessando".
- **`useEffect`:** escutas do `onAuthStateChanged` e do `onSnapshot`, sempre com a função de limpeza.
- **`useMemo`:** lista filtrada/ordenada, contadores e ranking, recalculados só quando os itens mudam.
- **`useCallback` e `useRef`:** em [`useAction`](src/hooks/useAction.ts), o `useRef` bloqueia cliques duplos sem esperar uma nova renderização.
- **`useContext` / Context API:**
  - `AuthContext`: usuário logado;
  - `FridgeContext`: **uma única escuta** da geladeira e dos itens, compartilhada por todas as telas dela. Quando alguém confessa, a lista, os detalhes e o mural mudam juntos.
- **Hooks customizados:** `useRealtime`, `useAction`, `useAuth`, `useCurrentUser`, `useFridgeContext`.
- **React 19:** `ref` passado como prop comum no `TextField` (sem `forwardRef`).
- **Componentes do React Native:**
  - `KeyboardAvoidingView` e `ScrollView` com `keyboardShouldPersistTaps`;
  - `Pressable` com estado `pressed`;
  - `Alert` com botões para confirmações;
  - `Share` (compartilhar o código) e `expo-clipboard` (copiar);
  - `ActivityIndicator`, `SafeAreaView`;
  - `TextInput` com `returnKeyType`/`onSubmitEditing` para pular de campo e máscara de data;
  - acessibilidade com `accessibilityRole` e `accessibilityLabel`.
- **Estilos:** `StyleSheet` e um tema central em [`theme/index.ts`](src/theme/index.ts).

### Tratamento de erros — [`errors.ts`](src/utils/errors.ts)

- **Validação antes da rede:** cada formulário tem a sua função em [`validation.ts`](src/utils/validation.ts), e os erros aparecem embaixo do campo.
- **`toUserMessage`:** traduz os códigos do Firebase (`auth/invalid-credential`, `permission-denied`, `unavailable`...) para português.
- **`AppError`:** erros de regra de negócio com a mensagem já pronta ("Código não encontrado", "Você é o admin...").
- **`withTimeout`:** o Firestore guarda escritas offline e só resolve a Promise quando o servidor responde. O timeout evita o botão "carregando para sempre" e explica o que aconteceu.
- **`useAction`:** centraliza carregando + `Alert` com o erro traduzido em todas as ações.
- **Três estados em toda tela que carrega dados:** carregando, erro (com "Tentar de novo") e vazio.
