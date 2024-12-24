export interface NotionPage {
  id: string;
  properties: {
    [key: string]: any;
  };
}

export interface NotionBlock {
  id: string;
  type: string;
  [key: string]: any;
}

export interface NotionResponse {
  page: NotionPage;
  blocks: NotionBlock[];
}