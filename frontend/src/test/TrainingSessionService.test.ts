import { getTrainingSessions } from "../services/trainingSessions";

describe("training session API errors", () => {
  it("presents a clear message when the API returns 429", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 429 }));

    await expect(getTrainingSessions()).rejects.toMatchObject({
      message: "Too many requests. Please wait a moment and try again.",
      status: 429,
    });
  });
});
