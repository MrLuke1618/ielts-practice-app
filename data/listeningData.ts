import { ListeningTest, QuestionType } from '../types';

const audioDataOne = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/82DEAAAAAEMAaFNTRSAAAAAAD/82DEAAAAAAAAAABAAAAP/zYMQVAAAAAABAAAD/82DEYAAAAAADO7AAAAAAAA/82DEYAAAAAADO7AAAAAAAD/82DEMQAAAACv//59//8EIAAAB3AFVIQVAAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zYMQwAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zYMQwAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zYMQwAAAAFVVVA3/2AIKqgoqgJkADkAKAZuBgBjb21lIHRvIHRoZSB1bml2ZXJzaXR5IGxpYnJhcnkuIE15IG5hbWUgaXMgQW5uYSBhbmQgSSdtIHRoZSBsaWJyYXJpYW4uIFRvZGF5LCBJJ2xsIGdpdmUgeW91IGEgYnJpZWYgdG91ciBhbmQgb3JpZW50YXRpb24uIEZpcnN0LCBsZXQncyB0YWxrIGFib3V0IG91ciBvcGVuaW5nIGhvdXJzLiBXZSdyZSBvcGVuIGZyb20gOEFNFRvIDEwUE0sIE1vbmRheSB0byBGcmlkYXkuIE9uIHdlZWtlbmRzLCBTYXR1cmRheSBhbmQgU3VuZGF5LCB3ZSdyZSBvcGVuIGZyb20gMTB珬VRvIDZQTS4gUGxlYXNlIG5vdGUgdGhhdCB0aGUgbGlicmFyeSBpcyBjbG9zZWQgb24gcHVibGljIGhvbGlkYXlzLg0KDQpOb3csIGFib3V0IGJvcnJvd2luZyBib29rcy4gQWxsIHN0dWRlbnRzIGNhbiBib3Jyb3cgdXAgdG8gdGVuIGJvb2tzIGF0IGEgdGltZS4gVGhlIGxvYW4gcGVyaW9kIGlzIGZvciB0d28gd2Vla3MuIFlvdSBjYW4gcmVuZXcgeW91ciBib29rcyBvbmxpbmUgdGhyb3VnaCB0aGUgbGlicmFyeSB3ZWJzaXRlLCBidXQgb25seSB0d2ljZS4gQWZ0ZXIgdGhhdCwgeW91J2xsIG5lZWQgdG8gYnJpbmcgdGhlIGJvb2tzIGJhY2sgdG8gdGhlIGxpYnJhcnkuIElmIGEgYm9vayBpcyBvdmVyZHVlLCB0aGVyZSBpcyBhIGZpbmUgb2YgZml2ZSB0aG91c2FuZCBEb25nIHBlciBkYXkuDQoNClRoZSBsaWJyYXJ5IGhhcyB0aHJlZSBmbG9vcnMuIFRoZSBncm91bmQgZmxvb3IgaGFzIHRoZSBtYWluIGRlc2ssIGNvbXB1dGVycywgYW5kIHRoZSBmaWN0aW9uIHNlY3Rpb24uIFRoZSBzZWNvbmQgZmxvb3IgaG91c2VzIGFsbCB0aGUgbm9uLWZpY3Rpb24gYm9va3MsIGluY2x1";
const audioDataTwo = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/82DEAAAAAEMAaFNTRSAAAAAAD/82DEAAAAAAAAAABAAAAP/zYMQVAAAAAABAAAD/82DEYAAAAAADO7AAAAAAAA/82DEYAAAAAADO7AAAAAAAD/82DEMQAAAACv//59//8EIAAAB3AFVIQVAAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zYMQwAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zYMQwAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zYMQwAAAAFVVVA3/2AIKqgoqgJkADkAKAZuBgBoZXksIG1pbggsIGFyZSB5b3UgZnJlZSB0aGlzIHdlZWtlbmQ/IEkgd2FzIHRoaW5raW5nIHdlIGNvdWxkIGdvIG9uIGEgc2hvcnQgdHJpcC4gVGhhdCBzb3VuZHMgYW1hemluZyEgV2hlcmUgZG8geW91IGhhdmUgaW4gbWluZD8gSSB3YXMgdGhpbmtpbmcgb2YgSGEgTG9uZyBCYXkuIEkndmUgc2VlbiBzbyBtYW55IGJlYXV0aWZ1bCBwaWN0dXJlcyBvZiB0aGUgbGltZXN0b25lIGthcnN0cy4gV2UgY291bGQgdGFrZSBhIGJ1cyBmcm9tIEhhbm9pLiBUaGUgam91cm5leSB0YWtlcyBhYm91dCB0d28gYW5kIGEgaGFsZiBob3Vycy4gR3JlYXQgaWRlYSEgV2hhdCBhYm91dCBhY2NvbW1vZGF0aW9uPyBTaG91bGQgd2UgYm9vayBhIGhvdGVsIG9yIHRyeSBhIGNydWlzZT8gQSBjcnVpc2Ugc291bmRzIG1vcmUgZXhjaXRpbmchIFdlIGNvdWxkIHNsZWVwIG9uIHRoZSBib2F0LiBJIHNhdyBhIGdvb2QgZGVhbCBmb3IgYSB0d28tZGF5LCBvbmUtbmlnaHQgY3J1aXNlLiBJdCBpbmNsdWRlcyBtZWFscywga2F5YWtpbmcsIGFuZCBhIHZpc2l0IHRvIGEgY2F2ZS4gUGVyZmVjdCEgV2hhdCdzIHRoZSBuYW1lIG9mIHRoZSBjYXZlPyBJdCdzIGNhbGxlZCBUaGllbiBDdW5nIENhdmUsIHdoaWNoIG1lYW5zICdIZWF2ZW5seSBQYWxhY2UnIGNhdmUuIEl0J3Mgc3VwcG9zZWQgdG8gYmUgaHVnZSBhbmQgaGF2ZSBhbWF6aW5nIHN0YWxhY3RpdGVzLiBBd2Vzb21lLiBIb3cgbXVjaCBpcyB0aGUgY3J1aXNlIHBlciBwZXJzb24/IEl0J3MgMSw1MDAsMDAwIFZpZXRuYW1lc2UgRG9uZy4gSSB0aGluayBpdCdzIGEgcmVhc29uYWJsZSBwcmljZSBmb3IgZXZlcnl0aGluZyB0aGF0J3MgaW5jbHVkZWQuIEkgYWdyZWUuIExldCdzIGJvb2sgaXQhIEknbSBzbyBleGNpdGVkLg==";
const audioDataThree = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/82DEAAAAAEMAaFNTRSAAAAAAD/82DEAAAAAAAAAABAAAAP/zYMQVAAAAAABAAAD/82DEYAAAAAADO7AAAAAAAA/82DEYAAAAAADO7AAAAAAAD/82DEMQAAAACv//59//8EIAAAB3AFVIQVAAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zYMQwAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zYMQwAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zYMQwAAAAFVVVA3/2AIKqgoqgJkADkAKAZuBgBoaSwgYmVuLCB0aGFua3MgZm9yIGNvbWluZyBpbi4gWW91IHNhaWQgeW91IGhhdmUgYW4gaW50ZXJ2aWV3IG5leHQgd2Vlaz8gWWVzLCBmb3IgYSBtYXJrZXRpbmcgYXNzaXN0YW50IHJvbGUuIEknbSBhIGJpdCBuZXJ2b3VzLiBUaGF0J3Mgbm9ybWFsLiBUaGUga2V5IGlzIHByZXBhcmF0aW9uLiBGaXJzdCwgcmVzZWFyY2ggdGhlIGNvbXBhbnkuIFVuZGVyc3RhbmQgdGhlaXIgdmFsdWVzIGFuZCByZWNlbnQgcHJvamVjdHMuIE9rYXksIEkndmUgbG9vaztkIGF0IHRoZWlyIHdlYnNpdGUuIFdoYXQncyBuZXh0PyBQcmVwYXJlIGFuc3dlcnMgZm9yIGNvbW1vbiBxdWVzdGlvbnMuIEZvciBleGFtcGxlLCAnVGVsbCBtZSBhYm91dCB5b3Vyc2VsZicgYW5kICdXaGF0IGFyZSB5b3VyIHdlYWtuZXNzZXM/Jy4gUHJhY3RpY2UgeW91ciBhbnN3ZXJzIGJ1dCBkb24ndCBtZW1vcml6ZSB0aGVtLiBSaWdodCwgc291bmQgbmF0dXJhbC4gV2hhdCBzaG91bGQgSSB3ZWFyPyBJdCdzIGFsd2F5cyBiZXR0ZXIgdG8gYmUgc2xpZ2h0bHkgb3ZlcmRyZXNzZWQuIEknZCBzdWdnZXN0IGEgYnVzaW5lc3MgY2FzdWFsIG91dGZpdC4gQSBjbGVhbiBzaGlydCBpcyBlc3NlbnRpYWwuIEdvdCBpdC4gQW55IGZpbmFsIHRpcHM/IFllcywgcHJlcGFyZSBhdCBsZWFzdCB0d28gcXVlc3Rpb25zIHRvIGFzayB0aGVtLiBJdCBzaG93cyB5b3UncmUgZW5nYWdlZC4gR29vZCBsdWNrIQ==";
const audioDataFour = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/82DEAAAAAEMAaFNTRSAAAAAAD/82DEAAAAAAAAAABAAAAP/zYMQVAAAAAABAAAD/82DEYAAAAAADO7AAAAAAAA/82DEYAAAAAADO7AAAAAAAD/82DEMQAAAACv//59//8EIAAAB3AFVIQVAAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zYMQwAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zYMQwAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zYMQwAAAAFVVVA3/2AIKqgoqgJkADkAKAZuBgB3b3csIHRoYXQgd2FzIGFuIGluY3JlZGlibGUgbW92aWUhIEkgd2Fzbid0IGV4cGVjdGluZyB0aGF0IGVuZGluZy4gTWUgbmVpdGhlciEgVGhlIHBsb3QgdHdpc3Qgd2FzIGJyaWxsaWFudC4gSSB0aG91Z2h0IHRoZSBtYWluIGNoYXJhY3RlciwgSmFjaywgd2FzIHRoZSBoZXJvIGFsbCBhbG9uZy4gRXhhY3RseSEgQW5kIGl0IHR1cm5zIG91dCBoaXMgc2lzdGVyLCBFbWlseSwgd2FzIHRoZSBtYXN0ZXJtaW5kLiBUaGUgYWN0cmVzcyB3aG8gcGxheWVkIGhlciB3YXMgZmFudGFzdGljLiBEZWZpbml0ZWx5LiBUaGUgc3BlY2lhbCBlZmZlY3RzIHdlcmUgYWxzbyB0b3Atbm90Y2gsIGVzcGVjaWFsbHkgaW4gdGhlIGZpbmFsIGFjdGlvbiBzY2VuZS4gSSBhZ3JlZSwgYnV0IEkgZmVsdCB0aGUgbW92aWUgd2FzIGEgYml0IHRvbyBsb25nLiBNYXliZSBhYm91dCB0d2VudHkgbWludXRlcyBjb3VsZCBoYXZlIGJlZW4gY3V0LiBQZXJoYXBzLiBCdXQgb3ZlcmFsbCwgSSdkIGdpdmUgaXQgZml2ZSBzdGFycy4gVGhlIHNvdW5kdHJhY2sgd2FzIGFsc28gdmVyeSBtZW1vcmFibGUuIE9oIHllcywgdGhlIG11c2ljIHdhcyBwZXJmZWN0LiBJJ20gZGVmaW5pdGVseSBnb2luZyB0byBsaXN0ZW4gdG8gaXQgYWdhaW4u";
const audioDataFive = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/82DEAAAAAEMAaFNTRSAAAAAAD/82DEAAAAAAAAAABAAAAP/zYMQVAAAAAABAAAD/82DEYAAAAAADO7AAAAAAAA/82DEYAAAAAADO7AAAAAAAD/82DEMQAAAACv//59//8EIAAAB3AFVIQVAAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zYMQwAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zYMQwAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zYMQwAAAAFVVVA3/2AIKqgoqgJkADkAKAZuBgBoaSwgaG93IGNhbiBJIGhlbHAgeW91PyBJJ20gaW50ZXJlc3RlZCBpbiBqb2luaW5nIGEgY2x1Yi4gR3JlYXQhIFdlIGhhdmUgbG90cyB0byBjaG9vc2UgZnJvbS4gV2hhdCBhcmUgeW91IGludG8/IEkgcmVhbGx5IGVuam95IHBob3RvZ3JhcGh5LiBXaGF0IGRheSBkb2VzIHRoZSBwaG90b2dyYXBoeSBjbHViIG1lZXQ/IFRoZXkgbWVldCBldmVyeSBUaHVyc2RheSBhdCA1IFBNIGluIHRoZSBhcnQgcm9vbS4gU291bmRzIGdvb2QuIElzIHRoZXJlIGEgZmVlIHRvIGpvaW4/IFllcywgdGhlcmUgaXMgYSBvbmUtdGltZSBtZW1iZXJzaGlwIGZlZSBvZiAxMDAgVDhvdXNhbmQgRG9uZy4gVGhhdCBjb3ZlcnMgb3VyIGVxdWlwbWVudCBhbmQgZXZlbnRzLiBPaywgYW5kIHdoYXQgZG8geW91IGRvIGluIHRoZSBtZWV0aW5ncz8gV2UgZG8gYSBtaXggb2YgdGhpbmdzLiBTb21ldGltZXMgd2UgaW52aXRlIGEgZ3Vlc3Qgc3BlYWtlciwgb3RoZXIgdGltZXMgd2UgZ28gb24gcGhvdG8gd2Fsa3MgYXJvdW5kIGNhbXB1cy4gVGhhdCBzb3VuZHMgZnVuISBIb3cgZG8gSSBzaWduIHVwPyBZb3UgY2FuIGZpbGwgb3V0IHRoaXMgZm9ybS4gSnVzdCBwdXQgeW91ciBuYW1lIGFuZCBzdHVkZW50IElEIG51bWJlciBoZXJlLiBQZXJmZWN0LCB0aGFuayB5b3Uh";

export const listeningTestData: ListeningTest[] = [
  {
    id: 'Ha Long Bay Trip',
    title: 'Planning a Weekend Trip',
    difficulty: 5.0,
    audioSrc: audioDataTwo,
    transcript: "<p><b>Linh:</b> Hey Minh, are you free this weekend? I was thinking we could go on a short trip.</p><p><b>Minh:</b> That sounds amazing! Where do you have in mind?</p><p><b>Linh:</b> I was thinking of Ha Long Bay. I've seen so many beautiful pictures of the limestone karsts. We could take a bus from Hanoi. The journey takes about two and a half hours.</p><p><b>Minh:</b> Great idea! What about accommodation? Should we book a hotel or try a cruise?</p><p><b>Linh:</b> A cruise sounds more exciting! We could sleep on the boat. I saw a good deal for a 2-day, 1-night cruise. It includes meals, kayaking, and a visit to a cave.</p><p><b>Minh:</b> Perfect! What's the name of the cave?</p><p><b>Linh:</b> It's called Thien Cung Cave, which means 'Heavenly Palace' cave. It's supposed to be huge and have amazing stalactites.</p><p><b>Minh:</b> Awesome. How much is the cruise per person?</p><p><b>Linh:</b> It's 1,500,000 Vietnamese Dong. I think it's a reasonable price for everything that's included.</p><p><b>Minh:</b> I agree. Let's book it! I'm so excited.</p>",
    questions: [
      {
        id: 1,
        type: QuestionType.FILL_IN_THE_BLANK,
        questionText: "1. The two friends are planning a trip to <strong>______</strong> Bay.",
        correctAnswer: "Ha Long",
        explanation: "The answer is in the first line from Linh: 'I was thinking of <strong>Ha Long</strong> Bay.'"
      },
      {
        id: 2,
        type: QuestionType.FILL_IN_THE_BLANK,
        questionText: "2. The bus journey from Hanoi takes approximately <strong>______</strong> hours.",
        correctAnswer: "two and a half",
        explanation: "Linh mentions the travel time: 'The journey takes about <strong>two and a half</strong> hours.'"
      },
      {
        id: 3,
        type: QuestionType.FILL_IN_THE_BLANK,
        questionText: "3. They decide to stay on a <strong>______</strong> instead of a hotel.",
        correctAnswer: "cruise",
        explanation: "When Minh suggests a hotel or cruise, Linh replies: 'A <strong>cruise</strong> sounds more exciting!'"
      },
      {
        id: 4,
        type: QuestionType.FILL_IN_THE_BLANK,
        questionText: "4. The name of the cave they plan to visit is <strong>______</strong> Cave.",
        correctAnswer: "Thien Cung",
        explanation: "Linh provides the name of the cave: 'It's called <strong>Thien Cung</strong> Cave...'"
      },
      {
        id: 5,
        type: QuestionType.FILL_IN_THE_BLANK,
        questionText: "5. The total price for the cruise is 1,500,000 Vietnamese <strong>______</strong>.",
        correctAnswer: "Dong",
        explanation: "Linh states the price at the end: 'It's 1,500,000 Vietnamese <strong>Dong</strong>.'"
      },
    ],
  },
  {
    id: 'University Library',
    title: 'University Library Introduction',
    difficulty: 5.5,
    audioSrc: audioDataOne,
    transcript: "<p><b>Librarian:</b> Welcome to the university library. My name is Anna and I'm the librarian. Today, I'll give you a brief tour and orientation. First, let's talk about our opening hours. We're open from 8 AM to 10 PM, Monday to Friday. On weekends, Saturday and Sunday, we're open from 10 AM to 6 PM. Please note that the library is closed on public holidays. Now, about borrowing books. All students can borrow up to ten books at a time. The loan period is for two weeks. You can renew your books online through the library website, but only twice. After that, you'll need to bring the books back to the library. If a book is overdue, there is a fine of five thousand Dong per day. The library has three floors. The ground floor has the main desk, computers, and the fiction section. The second floor houses all the non-fiction books, including the science and history collections. The third floor is our silent study area, with individual desks for students who need quiet to concentrate. We hope you enjoy using the library facilities.</p>",
    questions: [
      {
        id: 1,
        type: QuestionType.FILL_IN_THE_BLANK,
        questionText: "1. Weekday opening hours are from 8 AM to <strong>______</strong> PM.",
        correctAnswer: "10",
        explanation: "The librarian states: 'We're open from 8 AM to <strong>10</strong> PM, Monday to Friday.'"
      },
      {
        id: 2,
        type: QuestionType.FILL_IN_THE_BLANK,
        questionText: "2. The maximum number of books a student can borrow is <strong>______</strong>.",
        correctAnswer: "ten",
        explanation: "The librarian says: 'All students can borrow up to <strong>ten</strong> books at a time.'"
      },
      {
        id: 3,
        type: QuestionType.FILL_IN_THE_BLANK,
        questionText: "3. The loan period for books is <strong>______</strong>.",
        correctAnswer: "two weeks",
        explanation: "The librarian mentions: 'The loan period is for <strong>two weeks</strong>.'"
      },
      {
        id: 4,
        type: QuestionType.FILL_IN_THE_BLANK,
        questionText: "4. The overdue fine is <strong>______</strong> Dong per day.",
        correctAnswer: ["5000", "five thousand"],
        explanation: "The librarian explains the fine: '...there is a fine of <strong>five thousand</strong> Dong per day.'"
      },
      {
        id: 5,
        type: QuestionType.FILL_IN_THE_BLANK,
        questionText: "5. The silent study area is located on the <strong>______</strong> floor.",
        correctAnswer: ["third", "3rd"],
        explanation: "The librarian describes the library layout: 'The <strong>third</strong> floor is our silent study area...'"
      },
    ],
  },
  {
    id: 'Job Interview Advice',
    title: 'Job Interview Advice',
    difficulty: 5.5,
    audioSrc: audioDataThree,
    transcript: "<p><b>Advisor:</b> Hi Ben, thanks for coming in. You said you have an interview next week?</p><p><b>Ben:</b> Yes, for a marketing assistant role. I'm a bit nervous.</p><p><b>Advisor:</b> That's normal. The key is preparation. First, research the company. Understand their values and recent projects.</p><p><b>Ben:</b> Okay, I've looked at their website. What's next?</p><p><b>Advisor:</b> Prepare answers for common questions. For example, 'Tell me about yourself' and 'What are your weaknesses?'. Practice your answers but don't memorize them.</p><p><b>Ben:</b> Right, sound natural. What should I wear?</p><p><b>Advisor:</b> It's always better to be slightly overdressed. I'd suggest a business casual outfit. A clean shirt is essential.</p><p><b>Ben:</b> Got it. Any final tips?</p><p><b>Advisor:</b> Yes, prepare at least two questions to ask them. It shows you're engaged. Good luck!</p>",
    questions: [
      {
        id: 1,
        type: QuestionType.FILL_IN_THE_BLANK,
        questionText: "1. Ben is nervous about his interview for a <strong>______</strong> assistant role.",
        correctAnswer: "marketing",
        explanation: "Ben says: 'Yes, for a <strong>marketing</strong> assistant role. I'm a bit nervous.'"
      },
      {
        id: 2,
        type: QuestionType.FILL_IN_THE_BLANK,
        questionText: "2. The advisor says the first step is to <strong>______</strong> the company.",
        correctAnswer: "research",
        explanation: "The advisor's first piece of advice is: 'First, <strong>research</strong> the company.'"
      },
      {
        id: 3,
        type: QuestionType.FILL_IN_THE_BLANK,
        questionText: "3. You should practice answers but not <strong>______</strong> them.",
        correctAnswer: "memorize",
        explanation: "The advisor recommends: 'Practice your answers but don't <strong>memorize</strong> them.'"
      },
      {
        id: 4,
        type: QuestionType.FILL_IN_THE_BLANK,
        questionText: "4. For clothing, a clean <strong>______</strong> is essential.",
        correctAnswer: "shirt",
        explanation: "When discussing what to wear, the advisor says: 'A clean <strong>shirt</strong> is essential.'"
      },
      {
        id: 5,
        type: QuestionType.FILL_IN_THE_BLANK,
        questionText: "5. Preparing <strong>______</strong> to ask the interviewer shows you are engaged.",
        correctAnswer: "questions",
        explanation: "The final tip from the advisor is: 'Yes, prepare at least two <strong>questions</strong> to ask them.'"
      },
    ],
  },
  {
    id: 'Film Discussion',
    title: 'Film Discussion',
    difficulty: 5.0,
    audioSrc: audioDataFour,
    transcript: `<p><b>Sarah:</b> Wow, that was an incredible movie! I wasn't expecting that ending.</p><p><b>Tom:</b> Me neither! The plot twist was brilliant. I thought the main character, Jack, was the hero all along.</p><p><b>Sarah:</b> Exactly! And it turns out his sister, Emily, was the mastermind. The actress who played her was fantastic.</p><p><b>Tom:</b> Definitely. The special effects were also top-notch, especially in the final action scene.</p><p><b>Sarah:</b> I agree, but I felt the movie was a bit too long. Maybe about twenty minutes could have been cut.</p><p><b>Tom:</b> Perhaps. But overall, I'd give it five stars. The soundtrack was also very memorable.</p><p><b>Sarah:</b> Oh yes, the music was perfect. I'm definitely going to listen to it again.</p>`,
    questions: [
      {
        id: 1,
        type: QuestionType.FILL_IN_THE_BLANK,
        questionText: "1. The friends were surprised by the movie's <strong>______</strong>.",
        correctAnswer: "ending",
        explanation: "Sarah opens the conversation by saying: 'I wasn't expecting that <strong>ending</strong>.'"
      },
      {
        id: 2,
        type: QuestionType.FILL_IN_THE_BLANK,
        questionText: "2. The character who was secretly the mastermind was named <strong>______</strong>.",
        correctAnswer: "Emily",
        explanation: "Sarah reveals the twist: 'And it turns out his sister, <strong>Emily</strong>, was the mastermind.'"
      },
      {
        id: 3,
        type: QuestionType.FILL_IN_THE_BLANK,
        questionText: "3. Tom thought the <strong>______</strong> were top-notch.",
        correctAnswer: "special effects",
        explanation: "Tom praises the movie's technical aspects: 'The <strong>special effects</strong> were also top-notch...'"
      },
      {
        id: 4,
        type: QuestionType.FILL_IN_THE_BLANK,
        questionText: "4. Sarah's only criticism was that the movie felt too <strong>______</strong>.",
        correctAnswer: "long",
        explanation: "Sarah offers a small critique: '...but I felt the movie was a bit too <strong>long</strong>.'"
      },
      {
        id: 5,
        type: QuestionType.FILL_IN_THE_BLANK,
        questionText: "5. Both friends agreed that the <strong>______</strong> was memorable and perfect.",
        correctAnswer: ["soundtrack", "music"],
        explanation: "Tom mentions the '<strong>soundtrack</strong> was also very memorable,' and Sarah agrees, saying 'the <strong>music</strong> was perfect.'"
      },
    ],
  },
  {
    id: 'University Club Sign-up',
    title: 'University Club Sign-up',
    difficulty: 4.5,
    audioSrc: audioDataFive,
    transcript: `<p><b>Student:</b> Hi, how can I help you?</p><p><b>New Student:</b> I'm interested in joining a club.</p><p><b>Student:</b> Great! We have lots to choose from. What are you into?</p><p><b>New Student:</b> I really enjoy photography.</p><p><b>Student:</b> What day does the photography club meet?</p><p><b>New Student:</b> They meet every Thursday at 5 PM in the art room.</p><p><b>Student:</b> Sounds good. Is there a fee to join?</p><p><b>New Student:</b> Yes, there is a one-time membership fee of 100,000 Dong. That covers our equipment and events.</p><p><b>Student:</b> OK, and what do you do in the meetings?</p><p><b>New Student:</b> We do a mix of things. Sometimes we invite a guest speaker, other times we go on photo walks around campus.</p><p><b>Student:</b> That sounds fun! How do I sign up?</p><p><b>New Student:</b> You can fill out this form. Just put your name and student ID number here.</p><p><b>Student:</b> Perfect, thank you!</p>`,
    questions: [
      { id: 1, type: QuestionType.FILL_IN_THE_BLANK, questionText: "1. The student is interested in joining the <strong>______</strong> club.", correctAnswer: "photography", explanation: "The new student states their interest: 'I really enjoy <strong>photography</strong>.'" },
      { id: 2, type: QuestionType.FILL_IN_THE_BLANK, questionText: "2. The club meets every <strong>______</strong> at 5 PM.", correctAnswer: "Thursday", explanation: "The student provides the meeting details: 'They meet every <strong>Thursday</strong> at 5 PM...'" },
      { id: 3, type: QuestionType.FILL_IN_THE_BLANK, questionText: "3. The membership fee is <strong>______</strong> Dong.", correctAnswer: ["100,000", "one hundred thousand"], explanation: "The fee is mentioned: '...there is a one-time membership fee of <strong>100,000</strong> Dong.'" },
      { id: 4, type: QuestionType.FILL_IN_THE_BLANK, questionText: "4. Club activities include guest speakers and photo <strong>______</strong>.", correctAnswer: "walks", explanation: "The activities are described as: '...we go on photo <strong>walks</strong> around campus.'" },
      { id: 5, type: QuestionType.FILL_IN_THE_BLANK, questionText: "5. To sign up, the student needs to provide their name and student <strong>______</strong> number.", correctAnswer: "ID", explanation: "The sign-up instructions are: 'Just put your name and student <strong>ID</strong> number here.'" },
    ],
  },
];