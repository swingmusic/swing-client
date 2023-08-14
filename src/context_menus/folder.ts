import * as icons from "@/icons";
import { ContextSrc } from "@/enums";
import { Option, Playlist } from "@/interfaces";
import { getTracksInPath } from "@/requests/folders";

import useQueueStore from "@/stores/queue";
import useModalStore from "@/stores/modal";
import useSettingsStore from "@/stores/settings";

import { addFolderToPlaylist } from "@/requests/playlists";
import { getAddToPlaylistOptions, separator } from "./utils";

export default async (trigger_src: ContextSrc, path: string) => {
  const settings = useSettingsStore();
  const modal = useModalStore();

  const getListModeOption = () =>
    <Option>{
      label: settings.folder_list_mode ? "Grid Mode" : "List Mode",
      action: () => settings.toggleFolderListMode(),
      icon: settings.folder_list_mode ? icons.GridIcon : icons.PlaylistIcon,
    };

  // if trigger source is folder nav, show list mode option
  let items =
    trigger_src === ContextSrc.FolderNav
      ? [separator, getListModeOption()]
      : [];

  const play_next = <Option>{
    label: "Play next",
    action: () => {
      getTracksInPath(path).then((tracks) => {
        const store = useQueueStore();
        store.insertAfterCurrent(tracks);
      });
    },
    icon: icons.PlayNextIcon,
  };

  const add_to_queue = <Option>{
    label: "Add to Queue",
    action: () => {
      getTracksInPath(path).then((tracks) => {
        const store = useQueueStore();
        store.addTracksToQueue(tracks);
      });
    },
    icon: icons.AddToQueueIcon,
  };

  // Action for each playlist option
  const AddToPlaylistAction = (playlist: Playlist) => {
    addFolderToPlaylist(playlist, path);
  };

  const add_to_playlist = <Option>{
    label: "Add to Playlist",
    children: await getAddToPlaylistOptions(AddToPlaylistAction, {
      path,
    }),
    icon: icons.PlusIcon,
  };

  const save_as_playlist = <Option>{
    label: "Save as Playlist",
    action: () => modal.showSaveFolderAsPlaylistModal(path),
    icon: icons.PlaylistIcon,
  };

  return [
    play_next,
    add_to_queue,
    separator,
    add_to_playlist,
    save_as_playlist,
    ...items,
  ];
};
