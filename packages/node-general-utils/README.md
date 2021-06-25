# @villedemontreal/general-utils

Ensemble d'utilitaires généraux.

Fournie également des constantes globales, par exemple les noms d'environnements
standardisés pour nos projets.

## Installation

Install it:

```shell
    npm install @villedemontreal/general-utils
    yarn add @villedemontreal/general-utils
```

## Usage

Exemple :

```typescript
import { utils } from '@villedemontreal/general-utils';
```

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

# Notes sur la dépendance "@villedemontreal/scripting"

Pour éviter d'avoir une hiérarchie trop profonde dans `node_modules`, nous incluons la librarie de scripting
"`@villedemontreal/scripting`" en spécifiant uniquement _sa version majeure_
(par exemple: "`^1`" ou "`^2`"). La raison est que cette librairie de scripting, ainsi que la librairie présente,
s'utilisent chacune mutuellement. En spécifiant uniquement la version majeure de la librairie
de scripting, seul _le plus récent artifact_ à cette version majeure sera ajouté ici au `node_modules`.

**Note**: Si jamais un jour il y a des scripts custom d'ajouter à cette librairie, il faudra aussi s'assurer
de ne pas provoquer de dépendances circulaires en important des composants de la librairie de scripting qui eux-mêmes importeraient en ce faisant des composants de la librairie présente! D'hériter de la classe `ScriptBase` serait,
cela dit, sans problème car cet import ne génère aucune dépendance circulaire.

# Aide / Contributions

Notez que les contributions sous forme de pull requests sont bienvenues.
