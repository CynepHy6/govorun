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
  elements: []
}
