class ZipkinRequest {
  #store;
  #initialData = {
    version: '0.1',
    isEnabled: false,
    generateTraceId: false,
    lastTraceId: null,
  };

  constructor(store, requestId) {
    this.#store = store;
    this.requestId = requestId;
  }

  async getData() {
    return await this.#findOrCreate();
  }

  async isTraceEnabled() {
    const data = await this.#findOrCreate();
    return data.isEnabled;
  }

  async enableTrace() {
    const data = await this.#findOrCreate();
    data.isEnabled = true;
    await this.#update(data);
  }

  async disableTrace() {
    const data = await this.#findOrCreate();
    data.isEnabled = false;
    await this.#update(data);
  }

  async getLastTraceId() {
    const data = await this.#findOrCreate();
    return data.lastTraceId;
  }

  async setLastTraceId(traceId) {
    const data = await this.#findOrCreate();
    data.lastTraceId = traceId;
    await this.#update(data);
  }

  async enableTraceIdGeneration() {
    const data = await this.#findOrCreate();
    data.generateTraceId = true;
    await this.#update(data);
  }

  async disableTraceIdGeneration() {
    const data = await this.#findOrCreate();
    data.generateTraceId = false;
    await this.#update(data);
  }

  // private

  async #findOrCreate() {
    try {
      const data = await this.#store.getItem(this.requestId);
      if (data != null) {
        return JSON.parse(data);
      }

      await this.#update(this.#initialData);
      return this.#initialData;
    } catch (err) {
      console.log(err);
    }
  }

  async #update(data) {
    await this.#store.setItem(this.requestId, JSON.stringify(data));
  }
}

export { ZipkinRequest };
