import { GetStaticProps } from 'next';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

 export default function Home({postsPagination}: HomeProps) {
   // TODO
   console.log('postsPagination: ',postsPagination)
   return(
    
        <main className={styles.container}>
            <div className={styles.posts}>
                 { postsPagination?.results.map(post => (
                    <Link href={`/posts/${post.uid}`} >
                        <a key={post.uid} >
                          <time>{post.first_publication_date}</time>
                            <strong>{post.data.title}</strong>
                            <p>{post.data.author}</p>
                         </a>
                    </Link>
                 ))}
            </div>
        </main>
    

   
    )
 }

 export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query([
      Prismic.predicates.at('document.type','post')
  ], {
      fetch: ['post.title','post.subtitle','post.author','post.content'],
      pageSize:100,
  })


  const posts = {
    next_page: response.next_page,
    results:response.results.map(post => {
      return {
        slug:post.uid,
        first_publication_date:post.first_publication_date,
        data: {
          title:post.data.title,
          subtitle:post.data.subtitle,
          author:post.data.author
        }
        
      }
    })

  } 

 

  return {
      props : {posts}

  }
}
