"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../azureDevOps/client");
describe("createAzureDevOpsClient", () => {
    it("baseURL'yi doğru kurar", () => {
        const client = (0, client_1.createAzureDevOpsClient)("klogs", "test-pat");
        expect(client.defaults.baseURL).toBe("https://dev.azure.com/klogs");
    });
    it("Authorization başlığını Basic base64 olarak oluşturur", () => {
        const client = (0, client_1.createAzureDevOpsClient)("klogs", "my-pat");
        const expected = "Basic " + Buffer.from(":my-pat").toString("base64");
        expect(client.defaults.headers.Authorization).toBe(expected);
    });
});
//# sourceMappingURL=client.test.js.map