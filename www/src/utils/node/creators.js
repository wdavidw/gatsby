const slugify = require(`slugify`)
const { getTemplate } = require(`../get-template`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const creatorPageTemplate = getTemplate(`template-creator-details`)

  const { data, errors } = await graphql(`
    query {
      allCreatorsYaml {
        nodes {
          name
          fields {
            slug
          }
        }
      }
    }
  `)
  if (errors) throw errors

  data.allCreatorsYaml.nodes.forEach(node => {
    if (!node.fields) return
    if (!node.fields.slug) return
    createPage({
      path: `${node.fields.slug}`,
      component: creatorPageTemplate,
      context: {
        slug: node.fields.slug,
        name: node.name,
      },
    })
  })
}

exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions
  let slug
  if (node.internal.type === `CreatorsYaml`) {
    // Creator pages
    const validTypes = {
      individual: `people`,
      agency: `agencies`,
      company: `companies`,
    }

    if (!validTypes[node.type]) {
      throw new Error(
        `Creators must have a type of “individual”, “agency”, or “company”, but invalid type “${node.type}” was provided for ${node.name}.`
      )
    }
    slug = `/creators/${validTypes[node.type]}/${slugify(node.name, {
      lower: true,
    })}`
    createNodeField({ node, name: `slug`, value: slug })
  }
}
