# @villedemontreal/utils-knex

Module d'utilitaires pour la librairie Knex.

## Availabililty

https://github.com/VilledeMontreal/node-core-libs/tree/main/packages/node-utils-knex

## Installation

Installer la bibliothèque:

```shell
    npm install --save @villedemontreal/utils-knex
```

## Utilisation

# Configurations

Un code utilisant cette librarie doit premièrement la configurer en appellant la fonction
"`ìnit(...)`" exportée par le fichier "`src/config/init.ts`".

La configuration "`loggerCreator`" est _requise_ par cette librairie. Cela signifie qu'un code utilisant la librairie
(que ce soit du code d'un projet d'API ou d'une autre librairie) _doit_ setter cette configuration _avant_ que les composants
de la librairie ne soient utilisés.

Par exemple, dans un projet d'API basé sur le générateur
[generator-mtl-node-api](https://bitbucket.org/villemontreal/generator-mtl-node-api), ceci sera effectué dans le
fichier "`src/init.ts`", au début de la fonction `initComponents()` :

```typescript
import { init as initKnexUtilsLib } from '@villemontreal/core-utils-knex-nodejs-lib';
import { createLogger } from './utils/logger';

export async function initComponents() {
  initKnexUtilsLib(createLogger);

  //...
}
```

Si vous configurez la librairie depuis _une autre librairie_, vous aurez à passer
le "`Logger Creator`" que vous aurez _vous-même_ reçu comme configurations! :

```typescript
import { init as initKnexUtilsLib } from '@villemontreal/core-utils-knex-nodejs-lib';
import { configs } from './configs';

export async function initComponents() {
  initKnexUtilsLib(configs.loggerCreator);

  //...
}
```

Le but étant que toutes les librairies utilisées dans un projet d'API, ainsi que leurs propres librairies
transitives, puissent logger de la même manière et aient accès aux bons Correlation Ids.

Finalement, notez qu'une fonction "`isInited()`" est exportée et permet au code appelant de valider que la librairie a été
configurée correctement!

# Builder le projet

**Note**: Sur Linux/Mac assurz-vous que le fichier `run` est exécutable. Autrement, lancez `chmod +x ./run`.

Pour lancer le build :

- > `run compile` ou `./run compile` (sur Linux/Mac)

Pour lancer les tests :

- > `run test` ou `./run test` (sur Linux/Mac)

# Mode Watch

Lors du développement, il est possible de lancer `run watch` (ou `./run watch` sur Linux/mac) dans un terminal
externe pour démarrer la compilation incrémentale. Il est alors possible de lancer certaines _launch configuration_
comme `Debug current tests file - fast` dans VsCode et ainsi déboguer le fichier de tests présentement ouvert sans
avoir à (re)compiler au préalable (la compilation incrémentale s'en sera chargé).

Notez que, par défaut, des _notifications desktop_ sont activées pour indiquer visuellement si la compilation
incrémentale est un succès ou si une erreur a été trouvée. Vous pouvez désactiver ces notifications en utilisant
`run watch --dn` (`d`isable `n`otifications).

# Déboguer le projet

Trois "_launch configurations_" sont founies pour déboguer le projet dans VSCode :

- "`Debug all tests`", la launch configuration par défaut. Lance les tests en mode debug. Vous pouvez mettre
  des breakpoints et ils seront respectés.

- "`Debug a test file`". Lance _un_ fichier de tests en mode debug. Vous pouvez mettre
  des breakpoints et ils seront respectés. Pour changer le fichier de tests à être exécuté, vous devez modifier la ligne appropriée dans le fichier "`.vscode/launch.json`".

- "`Debug current tests file`". Lance le fichier de tests _présentement ouvert_ dans VSCode en mode debug. Effectue la compîlation au préalable.

- "`Debug current tests file - fast`". Lance le fichier de tests _présentement ouvert_ dans VSCode en mode debug. Aucune compilation
  n'est effectuée au préalable. Cette launch configuration doit être utilisée lorsque la compilation incrémentale roule (voir la section "`Mode Watch`" plus haut)

# Gérer les transactions SQL dans son projet/API

Dans cette librairie est fourni un composant nommé `KnexTransactionManager` permettant d'exécuter
plusieures requêtes SQL au sein d'une même transaction. Si une des requêtes échoue,
toutes les requêtes déjà effectuées seront rollbackées. En d'autres mots, toutes les requêtes doivent
résulter en un succès ou _aucune_ ne sera commitée.

Le pattern utilisé pour arriver à gérer de telles transactions est de passer un `context` (implémentant
l'interface `IDatabaseContext`) _à chaque méthodes suceptible d'exécuter, directement ou indirectement, une requête SQL_.
En gros, il s'agit de passer l'object `context`, que nous recevrons nous-mêmes, à toutes les
méthodes de _services_ ou de _repositories_ que nous appellons.

Il est fortement recommandé que ce paramètre `context` soit _toujours_ le premier dans la signature d'une méthode.
Par exemple, dans un service fictif `UserService`, il pourrait y avoir une méthode `updateUser`
prennant ce `context` comme premier paramètre:

```typescript
public async updateUser(context: IAppContext, userId: number, userToUpdate: IUser) {

  // On démarre un scope de transaction avec `withTransaction`
  await txManager.withTransaction(context, async (client: knex.Transaction) => {

    // Appel à une repository, en lui passant le contexte
    const updatedUser = await userRepository.updateUser(context, userId, userToUpdate);

    // Appel à un autre service, en lui passant  le contexte
    await indexationService.updateUserIndex(context, updatedUser);

    // Fait une requête SQL directement en utilisant
    // le client fourni par `withTransaction`!
    const res = await client(`statistics`).insert({
        something: 'blablabla'
    });
  });
}
```

Dans cet exemple on voit que:

- la méthode `updateUser` du service reçoit un `context` comme premier paramètre. C'est ce
  `context` qu'elle devra elle-même passer aux autres méthodes qu'elles appellera. Vous
  avez peut-être remarqué que le type de ce `context` est ici `IAppContext` et non `IDatabaseContext`!
  Il est en effet fréquent qu'une application crée son propre type de context
  _implémentant `IDatabaseContext`_. Ceci lui permet de passer des informations supplémentaires,
  de méthode en méthode! Par exemple, ce context spécialisé pourrait comprendre le `JWT` reçu lors de
  la requête HTTP, les paramètres de cette requête HTTP, etc. Par exemple:
  ```typescript
  export interface IAppContext extends IDatabaseContext {
    jwt: IJWTPayload;
  }
  ```
- Les appels devant faire partie d'une même transaction sont exécutés dans le "scope" de
  `txManager.withTransaction(...)`. Le code appellé reçoit un `client knex`, et c'est
  ce client qu'il doit utiliser pour effectuer ses requêtes SQL. Dans notre exemple, le service
  ne fait une seule requête SQL par lui-même: `client("statistics").insert(...)`. Mais il passe
  son `context` à une repossitory et à un autre service pour que la transaction qu'il a démarrée soit
  poursuivie correctement par ces composants.

Il faut savoir que la création de l'objet `context` _original_, celui qui devra par la suite être
passé de méthode en méthode, se fait en général _dans le contrôleur_ qui reçoit une requête HTTP.
Ce `context` initial aura sa propriété `currentKnexClient` non définie. C'est le premier appel à
`withClient` ou `withTransaction` qui s'occupera de le populer (puis de le tenir à jour).

Notez qu'en plus de `withTransaction`, le composant `KnexTransactionManager` fournit aussi une méthode
`withClient`. L'utilisation est la même, à la différence près qu'aucune transaction n'est
démarrée avec `withClient`. Ceci dit, il est possible que la méthode où s'effectue la requête
ne nécessitant pas de transaction _ait elle-même été appellée au sein d'un `withTransaction`_, bref dans le scope d'une transaction, par du code appelant! Dans cette situation, en utilisant le client knex fourni par `withClient`,
la transaction se poursuivra correctement. C'est pour cette raison qu'il faut _toujours_ utiliser
le client knex fourni par `withClient` et non un client knex créé manuellement...
`withClient` et `withTransaction` inspectent le `context` qui leur est passé et retourne un client
knex bien configuré, selon la situation.

Notez aussi que si `withTransaction` est appellée mais que le code est _déjà_ dans le scope
d'une transaction démarrée par du code appelant, la transaction déjà existante se poursuivera.
Il n'y aura pas de nouvelle transaction de démarrée.

Notez finalement qu'il peut être intéressant de wrapper les méthodes du `KnexTransactionManager`
dans des méthodes custom, pour simplifier et modifier leur utilisation. Par exemple:

```typescript
  public async withTransaction<T>(
    context: IAppContext,
    fnt: (client: knex.Transaction) => Promise<T>
  ): Promise<T> {
    return this.getKnexTransactionManager().withTransaction<T>(context, async (client: knex) => {
      try {
        return await fnt(client as any);
      } catch (err) {
        // ==========================================
        // Ici, nous pourrions avoir du code convertissant
        // les erreurs BD en erreur d'API standardisées,
        // par exemple.
        // ==========================================
        throw createErrorFromDatabaseError(err);
      }
    });
  }
```

Par la suite:

```typescript
// Utilisation de notre méthode `withTransaction` custom.
await withTransaction(context, async (client: knex.Transaction) => {
  const res = await client(`statistics`).insert({
    something: 'blablabla',
  });
});
```

**NOTE**: Voir le fichier de tests `src/transactionManager.test.ts` pour un exemple d'utilisation
du `KnexTransactionManager`.

# Versions et compatibilité

### 5.0.0

Utilise la version 5.0.0 de sqlite3

#### Compatibilité

- NodeJS : 16

# Test et publication de la librairie sur Nexus

En mergant une pull request dans la branche `develop`, un artifact "`-pre.build`" sera créé automatiquement dans Nexus. Vous
pouvez utiliser cette version temporaire de la librairie pour bien la tester dans un réel projet.

Une fois mergée dans `master`, la librairie est définitiement publiée dans Nexus, en utilisant la version spécifiée dans
le `package.json`.

# Aide / Contributions

Pour obtenir de l'aide avec cette librairie, vous pouvez poster sur la salle Google Chat [dev-discussions](https://chat.google.com/room/AAAASmiQveI).

Notez que les contributions sous forme de pull requests sont bienvenues.
