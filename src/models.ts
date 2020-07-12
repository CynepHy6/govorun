export interface Payload {
  client_msg_id: string,
  type: string,
  text: string,
  user: string,
  ts: string,
  thread_ts?: string,
  team: string,
  blocks: Block[],
  channel: string,
  event_ts: string,
  channel_type: string,
}

export interface Block {
  type: string,
  block_id: string,
  elements: string[]
}

export interface Special {
  [key: string]: string
}

export interface SearchResult {
  iid: string,
  team?: string,
  channel: Channel,
  type: string,
  user: string | null,
  username: string,
  ts: string,
  blocks: Block[],
  text: string,
  permalink: string,
  no_reactions: boolean,
  previous?: Previous,
  previous_2?: Previous
}

export interface Channel {
  channel: {
    id: string,
    is_channel: boolean,
    is_group: boolean,
    is_im: boolean,
    name: string,
    is_shared: boolean,
    is_org_shared: boolean,
    is_ext_shared: boolean,
    is_private: boolean,
    is_mpim: boolean,
    pending_shared: [],
    is_pending_ext_shared: boolean
  }
}

export interface Previous {
  type: string,
  user: string,
  username: string,
  ts: string,
  blocks: Block[],
  text: string,
  iid: string,
  permalink: string
}

export interface Ids {
  students: string[],
  teachers: string[],
  groups: string[]
}
