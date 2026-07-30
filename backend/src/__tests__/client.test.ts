import { createAzureDevOpsClient } from "../azureDevOps/client";

describe("createAzureDevOpsClient", () => {
  it("baseURL'yi doğru kurar", () => {
    const client = createAzureDevOpsClient("klogs", "test-pat");
    expect(client.defaults.baseURL).toBe("https://dev.azure.com/klogs");
  });

  it("Authorization başlığını Basic base64 olarak oluşturur", () => {
    const client = createAzureDevOpsClient("klogs", "my-pat");
    const expected = "Basic " + Buffer.from(":my-pat").toString("base64");
    expect(client.defaults.headers.Authorization).toBe(expected);
  });
});
