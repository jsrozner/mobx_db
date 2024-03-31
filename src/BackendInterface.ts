// Actual backend methods
// define fetch - an axios request of a certain kind;
// define save - writes back an object to the DB

import { Email } from "../src_backend/EmailModel";

import axios, { AxiosResponse } from "axios";
import { Unwrap } from "./BaseObject";
import { localDB } from "./localDB";

// todo: merge these two functions
// todo: tie to server (typerpc)
async function fetchDataSingle<T>(endpoint: string): Promise<Unwrap<T>> {
  try {
    const response: AxiosResponse<T> = await axios.get(endpoint);
    return localDB.createObjFromDataOrUpdate(response.data);
  } catch (error) {
    throw new Error(`Error fetching data from ${endpoint}: ${error}`);
  }
}
async function fetchDataArray<T>(endpoint: string): Promise<Unwrap<T>[]> {
  try {
    const response: AxiosResponse<T> = await axios.get(endpoint);
    if (!Array.isArray(response.data)) {
      throw new Error("expected arr");
    }
    return response.data.map((item: T) =>
      localDB.createObjFromDataOrUpdate(item),
    );
  } catch (error) {
    throw new Error(`Error fetching data from ${endpoint}: ${error}`);
  }
}

export const fetchEmails = async () => {
  return fetchDataArray<Email>("/emails");
  // return emails.map((item) => localDB.createObjFromDataOrUpdate(item));
};

export const fetchObj = async <T>(id: string) => {
  return await fetchDataSingle<T>(`/endpoint/${id}`); // Adjust the endpoint as needed
};
