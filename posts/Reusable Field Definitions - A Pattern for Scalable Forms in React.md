---
social-post: "A few years ago, long before ChatGPT, we had to build admin panels and user dashboards the hard way — lots of forms, lots of fields, lots of repetition.\nTo make our work faster (and saner), I built a code generator that took the database schema and created a full platform — not just admin tools, but actual user-facing apps too. And during that journey, a powerful pattern emerged.\n\U0001F449 We started treating fields as reusable, declarative definitions — making forms consistent, scalable, and easy to evolve.\nI wrote about this pattern, how it was born, and why I still find it useful today — especially in large apps with many roles, entities, and dynamic forms.\n\U0001F4A1 If you've ever felt your forms were too repetitive or hard to maintain, this might help:\nhashtag#ReactJS hashtag#FrontendEngineering hashtag#ReusableComponents hashtag#SoftwareArchitecture"
linkedin-url: >-
  https://www.linkedin.com/pulse/reusable-field-definitions-pattern-scalable-forms-gil-lopes-bueno-1zpkf
summary: >-
  A pattern born from code-generated CRUD platforms: declarative field
  definitions that power signup pages, profile editors, and admin screens from a
  single source of truth. Forms scale, validation stays centralized, and the UI
  keeps up with the domain.
og-image: >-
  /blog-images/reusable-field-definitions-a-pattern-for-scalable-forms-in-react.png
published-at: '2025-06-23T17:52:54.000+00:00'
---
A few years ago, before generative AI came onto the scene, I was working on systems that involved a lot of form-heavy interfaces. At the time, we built an internal code generator that could take a database schema and produce a robust web platform with full CRUD functionality for each entity.

It started with **admin panels**, but the most interesting part was this: we didn’t stop at internal tools — we used the same generator to build **the actual application used by end users** as well. This became even more powerful in products where multiple user types existed, each with their own dashboards, views, and forms.

So imagine a platform with admins, managers, and end users — all interacting with the same underlying data model, but through different interfaces. The ability to **generate forms dynamically** and customize which fields were shown depending on the context became not just convenient — it was essential.

---

### The Pattern: Declarative Field Definitions

As the system evolved, we realized we needed more flexibility in how forms were built and maintained. That led us to introduce a pattern that treated fields as **reusable, declarative units** — sort of like attributes in object-oriented programming.

Instead of manually building React forms field-by-field, we created a central configuration where each property of an entity (like User) was described once — with all the metadata needed to render, validate, and reuse it across the entire app.

```
export const userFieldDefinitions = {
  name: {
    name: 'name',
    label: 'Full Name',
    inputType: 'text',
    validation: z.string().min(2),
  },
  email: {
    name: 'email',
    label: 'Email',
    inputType: 'email',
    validation: z.string().email(),
  },
  birthday: {
    name: 'birthday',
    label: 'Date of Birth',
    inputType: 'date',
    validation: z.string(),
  },
};
```

Then we created a generic field renderer:

```
function FieldRenderer({ field }) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[field.name];

  return (
    <div>
      <label>{field.label}</label>
      <input type={field.inputType} {...register(field.name)} />
      {error && <span>{String(error.message)}</span>}
    </div>
  );
}
```

And finally, building a form became a matter of selecting which fields should appear:

```
const fieldSubset = ['name', 'email'];

<form onSubmit={handleSubmit(onSubmit)}>
  {fieldSubset.map((key) => (
    <FieldRenderer key={key} field={userFieldDefinitions[key]} />
  ))}
</form>
```

You could also derive the validation schema automatically from the same field definitions.

The code examples shown here are intentionally simplified to clearly demonstrate the core idea. In real-world, complex applications, this pattern can be extended to allow specifying exactly which React component should render each field, supporting custom inputs, complex widgets, or conditional rendering. This flexibility ensures the approach scales gracefully beyond basic use cases, accommodating a wide variety of UI and business requirements.

---

### Why It Worked So Well

In a project where we had many types of users and many forms per user, this pattern gave us:

- **Consistency across different parts of the app** — whether admin or user-facing.
    
- **Reusable form logic** — one field definition could power the user signup page, profile editor, and admin user management screen.
    
- **Centralized validation and display rules** — changes in field labels or requirements happened in one place.
    
- **A smooth path to customization** — different roles could see different subsets of fields, without duplicating code or logic.
    

It let us build applications that felt handcrafted, but under the hood, much of the structure was automated and shared.

---

### Final Thoughts

This pattern came from a very pragmatic place: building a lot of forms, fast, in a way that was still maintainable. And even though it was born out of code generation, the underlying idea holds up today — especially in large applications where forms are everywhere.

If your app has many fields, entities, and user roles, organizing your forms around **reusable field definitions** can save you time, reduce bugs, and keep your UI in sync with your domain model.

It’s a pattern I still return to, especially when building platforms where scale and flexibility matter.

---

_Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology._
