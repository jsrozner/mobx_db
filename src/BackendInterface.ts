// Actual backend methods
// define fetch - an axios request of a certain kind;
// define save - writes back an object to the DB

import { BEBaseObj, Email, UnwrapRefs } from "../src_backend/EmailModel";

import axios, { AxiosResponse } from "axios";

// todo: tie to server
async function fetchData<T>(endpoint: string): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axios.get(endpoint);
    return response.data;
  } catch (error) {
    // Handle errors here
    throw new Error(`Error fetching data from ${endpoint}: ${error}`);
  }
}

export const fetchEmails = async (): Promise<UnwrapRefs<Email>[]> => {
  return await fetchData("/emails");
};

export const fetchObj = async <T extends BEBaseObj>(id: string): Promise<T> => {
  return await fetchData<T>(`/endpoint/${id}`); // Adjust the endpoint as needed
};
