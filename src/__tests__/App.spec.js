import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { createMemoryHistory, createRouter } from "vue-router";

import App from "../App.vue";

describe("App", () => {
  it("mounts renders properly", async () => {
    const pinia = createPinia();

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: "/",
          name: "test-home",
          component: {
            template: "<div>HIS Frontend Test</div>"
          }
        }
      ]
    });

    router.push("/");
    await router.isReady();

    const wrapper = mount(App, {
      global: {
        plugins: [pinia, router]
      }
    });

    expect(wrapper.exists()).toBe(true);
  });
});
