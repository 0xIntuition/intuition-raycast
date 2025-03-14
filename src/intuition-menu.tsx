import { MenuBarExtra, Icon, launchCommand, LaunchType, openCommandPreferences } from "@raycast/api";
import { EXPLORER_URL } from "./lib/consts/general";

export default function Command() {
  return (
    <MenuBarExtra icon={{ source: { light: "light-icon.png", dark: "dark-icon.svg" } }} tooltip="Intuition">
      <MenuBarExtra.Item title="Search" />
      <MenuBarExtra.Item
        title="Atoms"
        icon={Icon.MagnifyingGlass}
        onAction={() => launchCommand({ name: "search-atoms", type: LaunchType.UserInitiated })}
      />
      <MenuBarExtra.Item
        title="Triples"
        icon={Icon.MagnifyingGlass}
        onAction={() => launchCommand({ name: "search-triples", type: LaunchType.UserInitiated })}
      />
      <MenuBarExtra.Item
        title="Lists"
        icon={Icon.List}
        onAction={() => launchCommand({ name: "search-lists", type: LaunchType.UserInitiated })}
      />
      <MenuBarExtra.Item title="My Intuition" />
      <MenuBarExtra.Item
        title="Positions"
        icon={Icon.Coins}
        onAction={() => launchCommand({ name: "search-atoms", type: LaunchType.UserInitiated })}
      />
      <MenuBarExtra.Item
        title="Created"
        icon={Icon.NewDocument}
        onAction={() => launchCommand({ name: "search-triples", type: LaunchType.UserInitiated })}
      />
      <MenuBarExtra.Item
        title="Followers"
        icon={Icon.Network}
        onAction={() => launchCommand({ name: "search-triples", type: LaunchType.UserInitiated })}
      />
      <MenuBarExtra.Item
        title="Following"
        icon={Icon.Binoculars}
        onAction={() => launchCommand({ name: "search-triples", type: LaunchType.UserInitiated })}
      />

      <MenuBarExtra.Item
        title="Configure Command"
        icon={Icon.Gear}
        shortcut={{ modifiers: ["cmd"], key: "," }}
        onAction={() => openCommandPreferences()}
      />
    </MenuBarExtra>
  );
}
